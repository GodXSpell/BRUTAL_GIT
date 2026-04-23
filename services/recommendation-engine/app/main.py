from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram
import structlog

from app.api.recommendations import router as rec_router
from app.api.health import router as health_router
from app.db.connection import init_db
from app.search.elasticsearch_client import init_es

log = structlog.get_logger()

# Metrics
RECOMMENDATION_REQUESTS = Counter(
    'recommendation_requests_total',
    'Total recommendation requests',
    ['intent', 'cold_start']
)
RECOMMENDATION_LATENCY = Histogram(
    'recommendation_latency_seconds',
    'Recommendation pipeline latency',
    ['stage']
)

app = FastAPI(
    title="StackMatch Recommendation Engine",
    description="Hybrid BM25 + ANN recommendation pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(rec_router, prefix="/api/v1")
app.include_router(health_router)


@app.on_event("startup")
async def startup():
    await init_db()
    await init_es()
    log.info("Recommendation engine started")
