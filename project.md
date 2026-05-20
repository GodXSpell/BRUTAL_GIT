# StackMatch (GitFinderV2) — Comprehensive Project & Architecture Specification

StackMatch is a personalized GitHub repository recommendation engine powered by hybrid search (BM25 + vector ANN) and a two-tower neural retrieval model. This document details the system design, microservices, databases, machine learning systems, data flows, and design choices.

---

## 1. System Overview & Architecture

StackMatch uses a microservices architecture deployed via Docker Compose (17 containers total). 

### System Diagram

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                        FRONTEND LAYER                       │
                               │  ┌───────────────────────────────────────────────────────┐  │
                               │  │                 Next.js 15 (React 19)                 │  │
                               │  │  Landing Page → OAuth → Intent Selection → Dashboard  │  │
                               │  └───────────────────────────┬───────────────────────────┘  │
                               └──────────────────────────────┼──────────────────────────────┘
                                                              │ HTTP (REST)
                               ┌──────────────────────────────┼──────────────────────────────┐
                               │                         API GATEWAY                         │
                               │  ┌───────────────────────────┴───────────────────────────┐  │
                               │  │               Spring Cloud Gateway (:8080)            │  │
                               │  │  Route: /api/v1/me/**       → User Profile Service    │  │
                               │  │  Route: /api/v1/recs/**     → Recommendation Engine   │  │
                               │  │  Route: /api/v1/feedback/** → Feedback Service        │  │
                               │  └───────────────────────────────────────────────────────┘  │
                               └─────────────────────────────────────────────────────────────┘
                                        │                    │                     │
                                        ▼                    ▼                     ▼
                              ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
                              │   User Profile   │ │  Recommendation  │ │     Feedback     │
                              │     Service      │ │     Engine       │ │     Service      │
                              │   (Java/SB3)     │ │  (Python/FAPI)   │ │   (Java/SB3)     │
                              │     :8081        │ │     :8000        │ │     :8082        │
                              │                  │ │                  │ │                  │
                              │ • OAuth2 Auth    │ │ • Hybrid Search  │ │ • Signal CRUD    │
                              │ • JWT Management │ │ • BM25 + ANN     │ │ • Kafka Pub      │
                              │ • Stack Analysis │ │ • RRF Fusion     │ │ • Emits EMB_UP   │
                              │ • Fw Detection   │ │ • Re-ranking     │ │                  │
                              └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                                       │                    │                    │
                                       └────────────┬───────┴────────────────────┘
                                                    │
                                         ┌──────────┴──────────┐
                                         │    Apache Kafka     │
                                         │                     │
                                         │ Topics:             │
                                         │ • user.stack.*      │
                                         │ • feedback.signal   │
                                         │ • feedback.embed.*  │
                                         │ • repo.indexed      │
                                         └──────────┬──────────┘
                                                    │
                                                    ▼
                               ┌────────────────────────────────────────┐
                               │               DATA LAYER               │
                               │  ┌──────────────┐  ┌──────────────┐    │
                               │  │  PostgreSQL  │  │Elasticsearch │    │
                               │  │   + pgvector │  │    8.12      │    │
                               │  │              │  │              │    │
                               │  │ • Users/Recs │  │ • BM25 index │    │
                               │  │ • Embeddings │  │ • Full-text  │    │
                               │  └──────┬───────┘  └──────────────┘    │
                               │         │                              │
                               │  ┌──────┴───────┐                      │
                               │  │    Redis     │                      │
                               │  │   7-alpine   │                      │
                               │  │ • Session/Rate │                      │
                               │  └──────────────┘                      │
                               └────────────────────────────────────────┘
```

### Microservices
1. **API Gateway (`api-gateway`)**: Spring Cloud Gateway routing incoming requests on port `8080` to downstream microservices.
2. **User Profile Service (`user-profile-service`)**: Spring Boot service handling GitHub OAuth2, JWT generation, fetching repository list from GitHub API, and running framework & language stack analysis.
3. **Recommendation Engine (`recommendation-engine`)**: FastAPI service executing hybrid search queries (vector + text), re-ranking repositories, generating explanations, and subscribing to feedback signals to execute user embedding updates.
4. **Feedback Service (`feedback-service`)**: Spring Boot service exposing REST endpoints to capture user interaction feedback (LIKES/DISLIKES/SKIPS) and publishing events to Apache Kafka.
5. **Ingestion Service (`ingestion-service`)**: Python service that async crawlers repository seed topics, computes health scores, computes 128-dimensional repo embeddings, and indexes them into Postgres and Elasticsearch.

### Technology Stack & Port Mapping
* **Frontend**: Next.js 15, React 19, Tailwind CSS (Brutalist style) → Port `3000`
* **API Gateway**: Spring Cloud Gateway → Port `8080`
* **User Profile Service**: Spring Boot 3.2 → Port `8081`
* **Feedback Service**: Spring Boot 3.2 → Port `8082`
* **Recommendation Engine**: FastAPI → Port `8000`
* **PostgreSQL + pgvector**: Vector DB -> Port `5432`
* **Elasticsearch**: Port `9200`
* **Redis**: Session Cache & Rate Limiting -> Port `6379`
* **Kafka**: Confluent cp-kafka -> Port `9092`
* **Kafka UI**: Port `8090`
* **Jaeger UI**: Port `16686`
* **Prometheus**: Port `9090`
* **Grafana**: Port `3001`

---

## 2. Ingestion & Search Pipelines

### Ingestion Service Pipeline
A scheduled APScheduler task crawls GitHub repositories from seed topics (e.g. `react`, `machine-learning`, `rust` etc.) and runs them through:
1. **Metadata Enrichment**: Fetches description, stars, forks, open issues, readme content, and whether the repo has a `CONTRIBUTING.md` file.
2. **Health Scorer**: Computes a custom float `health_score` (between `0.0` and `1.0`) measuring maintenance activity based on star counts, issues, open forks, and push frequency.
3. **Embedding Service**: Computes 128-dimensional dense item vectors.
4. **Bulk Indexing**: Writes repository data to PostgreSQL and publishes to Elasticsearch.

### Two-Stage Hybrid Retrieval & Search Pipeline
The Recommendation Engine retrieves personalized suggestions in 4 stages:

```
                  ┌────────────────────────────────────────┐
                  │          Parallel Retrieval            │
                  │  pgvector (ANN)   │  Elasticsearch     │
                  │  128-dim Cosine   │  BM25 Text Match   │
                  └────────┬──────────┴────────┬───────────┘
                           │                   │
                           ▼                   ▼
                  ┌────────────────────────────────────────┐
                  │      Reciprocal Rank Fusion (RRF)      │
                  │           Score combination            │
                  └────────────────────┬───────────────────┘
                                       │
                                       ▼
                  ┌────────────────────────────────────────┐
                  │      Feature-Based Re-ranking          │
                  │   Language & Framework Alignment,     │
                  │   Health, and Intent Overlap weights   │
                  └────────────────────┬───────────────────┘
                                       │
                                       ▼
                  ┌────────────────────────────────────────┐
                  │         Explanation Generation         │
                  │   Translates weights into human-       │
                  │   readable reasons                     │
                  └────────────────────────────────────────┘
```

1. **Stage 1: Parallel Retrieval**
   * **Vector Search (pgvector)**: Queries the `repositories` table for the top 100 closest documents utilizing the User's personal embedding vector.
   * **Text Search (Elasticsearch)**: Runs a BM25 query on term matches (primary languages, framework tags, intent signals, topics).
2. **Stage 2: Reciprocal Rank Fusion (RRF)**
   * Reranks candidates from both lists using Cormack's RRF formulation with constant $k=60$:
     $$RRF\_score(doc) = \sum_{m \in M} \frac{1}{60 + rank_m(doc)}$$
   * Docs returned in both lists are boosted significantly.
3. **Stage 3: Feature-Based Re-ranking**
   * Final score balances RRF ranking and detailed alignment features:
     $$final\_score = 0.40 \times \text{normalized\_rrf} + 0.60 \times \text{feature\_score}$$
   * The `feature_score` is computed dynamically as:
     * **Primary Language Overlap (30%)**: Matches the user's primary languages.
     * **Framework/Topic Matches (30%)**: Overlaps with technologies the user knows.
     * **Intent Alignment (20%)**: Emphasizes repository features matching the user's current goal:
       * `CONTRIBUTOR`: Prioritizes repos with `good-first-issues` and `CONTRIBUTING.md`.
       * `LEARNER`: Prioritizes repos tagged with `tutorial`, `learning`, `beginner`, or `course`.
       * `BUILDER`: Prioritizes repos with high stars/forks and tags like `library`, `sdk`, or `framework`.
     * **Repo Health (20%)**: Leverages the computed health score.
4. **Stage 4: Explanation Generation**
   * Appends up to 3 custom reasons (e.g. *"Written in TypeScript, your primary language"*, *"Tagged as learning-friendly content"*) explaining the match to the frontend dashboard.

---

## 3. Machine Learning Details & Embedding Strategy

### Two-Tower Architecture
StackMatch models recommendations using a PyTorch Two-Tower structure (`ml/two_tower/model.py`):
1. **User Tower**: Maps sparse/dense user profile features (88 dimensions total) to a 128-dimensional embedding.
   * *Features*: Language weights (20), Framework one-hot (50), Domain one-hot (10), Activity pattern (3), Intent (3), Total repos + stars given (2).
2. **Item (Repo) Tower**: Maps repository features (252 dimensions total) to a 128-dimensional embedding.
   * *Features*: Language one-hot (20), Topic multi-hot (100), Health metrics (4), Dense text-embedding projection (128).

Both towers use linear layers followed by Batch Normalization, ReLU activations, and Dropout, with final L2-normalization to restrict output to a hypersphere.

* **Loss Function**: Trained using In-batch Softmax Contrastive Loss (symmetric cross-entropy across user-to-item and item-to-user logits).

### Document Embedding & Orthogonal Projection
Instead of invoking full ML model forward passes for new items and queries in real-time, StackMatch employs a static projection matrix scheme:
1. Repo texts (description, topics, name, readme) are encoded using `SentenceTransformer("all-MiniLM-L6-v2")` to generate a 384-dimensional vector.
2. The vector is projected to the 128-dimensional target space using a fixed random projection matrix generated via QR Decomposition (seeded at `42` to guarantee determinism):
   $$\mathbf{e}_{128} = \mathbf{e}_{384} \cdot \mathbf{Q}$$
3. The projected vector is L2-normalized.

---

## 4. Online Feedback Loop & Embedding Nudging

Instead of computationally heavy model retraining, StackMatch implements **Real-Time Embedding Nudging**. Feedback signals nudge the user's vector in the 128-dimensional latent space:

```
                            User gives LIKED/DISLIKED signal
                                            │
                                            ▼
                              Feedback Service persists signal
                                            │
                                            ▼
                                  Kafka: feedback.signal
                                            │
                                            ▼
                              Kafka: feedback.embedding.update
                                     (Every 5 signals)
                                            │
                                            ▼
                               Recommendation Engine consumer
                                            │
                                            ▼
                                Online Embedding Updater:
                            LIKE:    u += lr * 1.0 * (r - u)
                            DISLIKE: u -= lr * 0.7 * (r - u)
                                            │
                                            ▼
                              L2-Normalize -> Momentum Blend
                                            │
                                            ▼
                                Persist back to PostgreSQL
```

### Update Equations
* **If LIKED / STARRED**:
  $$\mathbf{u}_{new} = \mathbf{u} + \eta \cdot 1.0 \cdot (\mathbf{r} - \mathbf{u})$$
* **If DISLIKED**:
  $$\mathbf{u}_{new} = \mathbf{u} - \eta \cdot 0.7 \cdot (\mathbf{r} - \mathbf{u})$$

Where $\eta$ (Learning Rate) is `0.05`.

### Normalization, Momentum & Persistence
1. **L2-Normalize**: Normalize $\mathbf{u}_{new}$ to unit length.
2. **Momentum Blend**: Blend updated vector with the original stack embedding using a momentum factor ($\beta = 0.85$) to prevent catastrophic drift away from their core developer profile:
   $$\mathbf{u}_{final} = \beta \cdot \mathbf{u}_{normalized} + (1 - \beta) \cdot \mathbf{u}_{original}$$
3. **Unit Sphere Projection**: Project $\mathbf{u}_{final}$ back to unit sphere.
4. **Persistence**: Writes $\mathbf{u}_{final}$ to the `user_embeddings` table and increases the version counter.

### Trigger Mechanism
* The **Feedback Service** counts the user's feedback events.
* Every **5 signals**, the service publishes a message to the `feedback.embedding.update` Kafka topic.
* The **Recommendation Engine**'s consumer processes this topic, pulls the 20 most recent feedback events, re-evaluates the equations, and writes the updated vector back to Postgres, immediately altering retrieval results in the next request.

---

## 5. PostgreSQL Database Schema & Key Indices

The system uses PostgreSQL 16 enriched with the `pgvector` extension. Key tables and indexes are described below:

### Core Tables
1. **`users`**: Contains GitHub OAuth profiles, access tokens, and username information.
2. **`user_stack_profiles`**: Holds analyzed language percentages (`primary_languages` JSONB), detected framework details (`frameworks` JSONB), inferred domain strings, and initial `profile_embedding` vectors.
3. **`repositories`**: Stashes the corpus of crawled repos, metadata, README snippets, and the item vector `repo_embedding`.
4. **`user_embeddings`**: Stores mutable user embeddings, versioning details, and feedback event counters.
5. **`feedback_signals`**: Records individual developer feedback records (`LIKE`, `DISLIKE`, `SKIP`, `CLICK`, `STAR`) with screen positions to log implicit biases.
6. **`recommendation_sessions` & `recommendation_items`**: Tracks recommendation histories, ranks, fusion methods, and explanations.

### Performance Index Design
* **Cosine Distance ANN (pgvector)**:
  * IVFFlat index on `user_stack_profiles.profile_embedding` using Cosine Similarity (`vector_cosine_ops`), set to 100 lists.
  * IVFFlat index on `repositories.repo_embedding` using Cosine Similarity, set to 200 lists.
* **Topic Search Optimization**:
  * GIN index on `repositories.topics` (`text[]` array) to accelerate tag overlap calculations.
* **Reranking Index Optimization**:
  * B-Tree indexes on `repositories.health_score DESC` and `repositories.stars DESC` to speed up candidate retrieval filters.

---

## 6. Event Backbone & Kafka Topology

Apache Kafka acts as the async communications layer. The topics and their partitions are detailed below:

| Topic Name | Partitions | Producer | Consumer(s) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user.profile.created` | 3 | `user-profile-service` | Ingestion, Analytics | Triggered upon a new user registration. |
| `user.stack.analyzed` | 3 | `user-profile-service` | `recommendation-engine` | Stack analysis complete, triggers initial embedding creation. |
| `recommendation.requested`| 6 | `recommendation-engine` | Analytics | Dispatched when recommendations are generated. |
| `feedback.signal` | 6 | `feedback-service` | Ingestion, Analytics | Dispatches raw like/dislike/skip events. |
| `feedback.embedding.update`| 3 | `feedback-service` | `recommendation-engine` | Triggers embedding updater on 5 feedback threshold. |
| `repo.indexed` | 6 | `ingestion-service` | Recommendation Engine | Fired when a new repository is successfully crawled. |
| `dlq.failed.events` | 1 | All services | Operations | Dead Letter Queue for processing error recovery. |

---

## 7. Frontend Design System & Aesthetics

The frontend is built using Next.js 15, styled with a striking **Brutalist theme** configured via Tailwind CSS (`frontend/tailwind.config.js`).

### Design System Configuration
* **Border Radii**: Strict brutalist `0px` defaults. High-contrast sharp corners on all buttons, forms, lists, and components.
* **Typography**:
  * Headlines: **Space Grotesk** (bold fonts, sizes up to 64px for title headers).
  * Body & Labels: **Inter** (monospaced weights and clean system readable sizing).
* **Color Palette (Dark Mode First)**:
  * Primary Accent: Neon Green (`#7bdb80`)
  * Secondary Accent: Muted Gold/Yellow (`#d8c93a`)
  * Tertiary Accent: Soft Purple (`#d2bbff`)
  * Background: Pure Onyx (`#10141a`)
  * Surfaces: Dark Gray (`#181c22` to `#31353c`)
  * Text Colors: High Contrast Gray/White (`#dfe2eb`)
* **Brutalist CSS Shadows (Defined in `globals.css`)**:
  * `.brutal-shadow-level-1`: `2px 2px 0px 0px rgba(255,255,255,1)`
  * `.brutal-shadow-level-2`: `4px 4px 0px 0px rgba(255,255,255,1)`
  * `.brutal-shadow-level-3`: `8px 8px 0px 0px rgba(255,255,255,1)`
  * Interactive action shadow shifts: `.brutal-button-interactive:active` translates elements slightly (`translate(2px, 2px)`) and removes shadows to simulate tactile clicks.

### Route Structures
* `/` (Landing): Introduction, landing marketing, and GitHub login initiation.
* `/oauth/callback` (Auth callback): Pulls authorization code, exchanges it for JWT, caches keys, and redirects to dashboard.
* `/dashboard` (Dashboard): Feeds main suggestions card list, hosts real-time like/dislike/skip controls.
* `/repositories` (Repositories): Provides list of indexed user repositories, statistics, languages, and custom details.
* `/settings` (Settings): Manages user intents, targets, deletion options, and personal adjustments.

---

## 8. Cold Start Strategy

When a new user signs up and possesses zero feedback history:
1. **Initial Vector**: Employs the raw parsed stack analysis embedding (generated from their public GitHub code profile).
2. **Stars Accumulation**: Pulls the embeddings of the user's top-starred repositories and averages them to refine the initial target vector.
3. **Intelligent Fallback**: In the absence of GitHub activity, defaults suggestions to popular health-evaluated items matching their primary language.
4. **Learning Initiation**: Transitions to active user embedding nudging after exactly **5 feedback inputs**.
