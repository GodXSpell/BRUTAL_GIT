# StackMatch — System Architecture

## Overview

StackMatch is a microservices-based recommendation engine that uses hybrid search (BM25 + ANN) backed by a two-tower neural retrieval model to deliver personalized GitHub repository recommendations.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15 (React 19)                    │    │
│  │  Landing Page → OAuth → Intent Selection → Dashboard        │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
│                                │                                    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │ HTTP/GraphQL
┌────────────────────────────────┼────────────────────────────────────┐
│                          API GATEWAY                                │
│  ┌─────────────────────────────┴───────────────────────────────┐    │
│  │              Spring Cloud Gateway (:8080)                   │    │
│  │  Route: /api/v1/me/**       → User Profile Service          │    │
│  │  Route: /api/v1/recs/**     → Recommendation Engine         │    │
│  │  Route: /api/v1/feedback/** → Feedback Service              │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ User Profile │   │  Recommendation  │   │    Feedback      │
│   Service    │   │     Engine       │   │    Service       │
│  (Java/SB3)  │   │  (Python/FAPI)   │   │  (Java/SB3)      │
│    :8081     │   │     :8000        │   │    :8082         │
│              │   │                  │   │                  │
│ • OAuth2     │   │ • Hybrid Search  │   │ • Signal CRUD    │
│ • JWT Auth   │   │ • BM25 + ANN     │   │ • Kafka Pub      │
│ • Stack      │   │ • RRF Fusion     │   │ • Embedding      │
│   Analysis   │   │ • Re-ranking     │   │   Trigger        │
│ • Framework  │   │ • Explanations   │   │                  │
│   Detection  │   │ • Online Learn   │   │                  │
└──────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
       │                    │                      │
       └────────────┬───────┴──────────────────────┘
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
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  PostgreSQL  │  │Elasticsearch │  │    Redis     │               │
│  │   + pgvector │  │    8.12      │  │   7-alpine   │               │
│  │              │  │              │  │              │               │
│  │ • Users      │  │ • BM25 index │  │ • Session    │               │
│  │ • Stacks     │  │ • Full-text  │  │   cache      │               │
│  │ • Repos      │  │   search     │  │ • Rate limit │               │
│  │ • Embeddings │  │              │  │              │               │
│  │   (vector)   │  │              │  │              │               │
│  │ • Feedback   │  │              │  │              │               │
│  │ • Sessions   │  │              │  │              │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY LAYER                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │    OTel      │  │   Jaeger     │  │   Grafana    │               │
│  │  Collector   │──│  (Traces)    │  │ (Dashboards) │               │
│  │  gRPC:4317   │  │   :16686     │  │   :3001      │               │
│  └──────────────┘  └──────────────┘  └──────┬───────┘               │
│                                              │                      │
│                                     ┌────────┴───────┐              │
│                                     │  Prometheus    │              │
│                                     │  (Metrics)     │              │
│                                     │   :9090        │              │
│                                     └────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Recommendation Pipeline

### Stage 1: Parallel Retrieval
```
User Embedding ──→ pgvector ANN search ──→ Top-100 candidates (vector)
User Stack Text ─→ Elasticsearch BM25 ──→ Top-100 candidates (text)
```

### Stage 2: Reciprocal Rank Fusion (RRF)
```
RRF_score(doc) = Σ 1/(k + rank_i(doc))  where k=60
```
Merges both ranked lists, rewarding documents appearing in BOTH.

### Stage 3: Feature-Based Re-ranking
```
final_score = 0.4 × normalized_rrf + 0.6 × feature_score

feature_score =
  0.30 × language_overlap +
  0.30 × framework/topic_match +
  0.20 × intent_alignment +
  0.20 × health_score
```

### Stage 4: Explanation Generation
Each recommendation includes up to 3 human-readable reasons.

---

## Two-Tower Model

```
User Features (88-dim)              Item Features (252-dim)
├─ Language weights (20)            ├─ Language one-hot (20)
├─ Framework one-hot (50)           ├─ Topic multi-hot (100)
├─ Domain one-hot (10)              ├─ Health/stars/contrib/issues (4)
├─ Activity pattern (3)             └─ Sentence embedding (128)
├─ Intent (3)
└─ Repo count + stars (2)
          │                                  │
          ▼                                  ▼
    ┌───────────┐                      ┌───────────┐
    │ User Tower│                      │ Item Tower│
    │ 88→256→128│                      │252→256→128│
    │ BN+ReLU+DO│                      │ BN+ReLU+DO│
    └─────┬─────┘                      └─────┬─────┘
          │                                  │
          ▼                                  ▼
    L2-normalized                      L2-normalized
    128-dim embedding                  128-dim embedding

Training: In-batch softmax contrastive loss
  loss = (CE(logits, labels) + CE(logits.T, labels)) / 2
```

---

## Online Learning Loop

```
User gives feedback (LIKE/DISLIKE)
        │
        ▼
  Feedback Service persists signal
        │
        ▼
  Kafka: feedback.signal
        │
        ▼
  Every 5 signals → Kafka: feedback.embedding.update
        │
        ▼
  Recommendation Engine consumer
        │
        ▼
  OnlineEmbeddingUpdater:
    LIKED:    user_emb += lr × (repo_emb - user_emb)
    DISLIKED: user_emb -= lr × (repo_emb - user_emb) × 0.7
    → L2 normalize → momentum blend → persist
```

---

## Data Schema

### Key Tables
- **users** — GitHub OAuth profiles
- **user_stack_profiles** — Analyzed stack (languages, frameworks, domains) + 128-dim embedding
- **repositories** — Crawled repo corpus with 128-dim embeddings
- **user_embeddings** — Mutable personalized embeddings (updated by feedback)
- **feedback_signals** — LIKE/DISLIKE/SKIP/CLICK/STAR signals
- **recommendation_sessions** — Session tracking for recommendation batches
- **recommendation_items** — Individual ranked recommendations per session

### Key Indexes
- IVFFlat on `user_stack_profiles.profile_embedding` (lists=100)
- IVFFlat on `repositories.repo_embedding` (lists=200)
- GIN on `repositories.topics`
- B-tree on `repositories.health_score DESC`, `repositories.stars DESC`
