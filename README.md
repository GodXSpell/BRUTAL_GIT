# StackMatch

> GitHub repository recommendation engine powered by hybrid BM25 + semantic vector search with a two-tower neural retrieval model.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![ML](https://img.shields.io/badge/ML-Two--Tower%20Neural%20Retrieval-purple)
![Search](https://img.shields.io/badge/Search-BM25%20%2B%20ANN%20Hybrid-green)
![Events](https://img.shields.io/badge/Events-Apache%20Kafka-orange)

---

## What It Does

1. **Connect GitHub** → OAuth login, fetch your repos
2. **Analyze Stack** → Detect languages, frameworks, domains from your code
3. **Generate Embedding** → Two-tower model maps your stack to 128-dim vector
4. **Hybrid Search** → BM25 (Elasticsearch) + ANN (pgvector) with Reciprocal Rank Fusion
5. **Personalized Feed** → Feature-based re-ranking with human-readable explanations
6. **Online Learning** → Feedback nudges your embedding in real-time

---

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Next.js    │────▶│   API Gateway   │────▶│  User Profile    │
│   Frontend   │     │  (Spring Cloud) │     │  Service (Java)  │
└──────────────┘     └─────────────────┘     └──────────────────┘
                            │                         │
                            ▼                         ▼
                     ┌──────────────┐         ┌──────────────┐
                     │  Rec Engine  │         │    Kafka     │
                     │  (FastAPI)   │         │   Backbone   │
                     └──────────────┘         └──────────────┘
                       │         │                    │
                       ▼         ▼                    ▼
                ┌──────────┐ ┌────────┐      ┌──────────────┐
                │   ES     │ │pgvector│      │  Feedback    │
                │  (BM25)  │ │ (ANN)  │      │  Service     │
                └──────────┘ └────────┘      └──────────────┘
```

---

## Tech Stack

| Layer              | Technology                                   |
|--------------------|----------------------------------------------|
| Frontend           | Next.js 15, React 19, Framer Motion          |
| API Gateway        | Spring Cloud Gateway                         |
| User Service       | Spring Boot 3.2, JPA, OAuth2, JWT            |
| Feedback Service   | Spring Boot 3.2, Kafka Producer              |
| Rec Engine         | FastAPI, hybrid BM25+ANN retrieval           |
| ML Model           | PyTorch Two-Tower (128-dim embeddings)       |
| Ingestion          | Python async crawler + sentence-transformers |
| Search             | Elasticsearch 8.12 (BM25) + pgvector (ANN)   |
| Database           | PostgreSQL 16 + pgvector extension           |
| Cache              | Redis 7                                      |
| Events             | Apache Kafka (Confluent)                     |
| Tracing            | OpenTelemetry → Jaeger                       |
| Metrics            | Prometheus → Grafana                         |
| Deployment         | Docker Compose (17 containers)               |

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- JDK 21 (for local dev)
- Node.js 20+ (for frontend dev)
- Python 3.11+ (for ML/ingestion dev)

### 1. Clone & Configure

```bash
git clone <repo-url> stackmatch
cd stackmatch
cp .env.example .env
# Edit .env with your GitHub OAuth credentials
```

### 2. Start Everything

```bash
docker compose up -d
```

### 3. Verify Services

| Service            | URL                             |
|--------------------|---------------------------------|
| Frontend           | http://localhost:3000           |
| API Gateway        | http://localhost:8080           |
| Kafka UI           | http://localhost:8090           |
| Jaeger UI          | http://localhost:16686          |
| Grafana            | http://localhost:3001           |
| Prometheus         | http://localhost:9090           |
| Elasticsearch      | http://localhost:9200           |

---

## API Endpoints

### REST (User Profile Service — :8081)
```
GET  /oauth2/authorize/github      → GitHub OAuth redirect
GET  /oauth2/callback/github       → OAuth callback, returns JWT
GET  /api/v1/me                    → Current user info
GET  /api/v1/me/stack              → Analyzed stack profile
POST /api/v1/me/intent             → Set recommendation intent
POST /api/v1/me/analyze            → Trigger re-analysis
```

### REST (Recommendation Engine — :8000)
```
GET  /api/v1/recommendations       → Personalized recommendation feed
POST /api/v1/embeddings/user       → Compute/update user embedding
GET  /health                       → Health check
```

### REST (Feedback Service — :8082)
```
POST /api/v1/feedback              → Record feedback signal
GET  /api/v1/feedback/history      → User feedback history
```

---

## Architecture Decisions

### Why Kafka over direct REST calls?
- Decouples services: feedback service doesn't need rec engine to be up
- Enables replay: reprocess all feedback if embedding logic changes
- Natural audit log for all user interactions

### Why Reciprocal Rank Fusion over learned weights?
- No labeled training data needed for fusion
- Provably optimal in expectation (Cormack et al., 2009)
- Simple, interpretable, production-battle-tested

### Why pgvector over Qdrant/Pinecone?
- Single infrastructure: avoid another operational component
- 500K repos × 128-dim = ~256MB — trivially fits in memory
- IVFFLAT index: sub-millisecond ANN at this scale

### Why online learning on only the user embedding?
- Full model retraining requires GPUs and hours
- Embedding nudging is O(1) per feedback signal
- Personalization at query time, not training time

### Why Two-Tower over Collaborative Filtering?
- CF needs dense user-item interaction matrix — sparse for new users
- Two-Tower works from content features alone → no cold-start problem
- Separable towers: item embeddings pre-computed, only user tower at query time

---

## Kafka Topics

| Topic                    | Partitions | Purpose                     |
|--------------------------|------------|-----------------------------|
| user.profile.created     | 3          | New user signup             |
| user.stack.analyzed      | 3          | Stack analysis complete     |
| recommendation.requested | 6          | Rec request events          |
| feedback.signal          | 6          | Raw feedback signals        |
| feedback.embedding.update| 3          | Trigger embedding updates   |
| repo.indexed             | 6          | New repo indexed            |
| dlq.failed.events        | 1          | Dead letter queue           |

---

## Cold Start Strategy

1. Use raw stack analysis as initial embedding
2. Average embeddings of user's top-starred repos
3. Fall back to popularity + language filter
4. After 5 feedback signals → start online learning

---

## License

MIT
