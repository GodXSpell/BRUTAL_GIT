import asyncio
import logging
import os
import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from ingestion.github_crawler import GitHubCrawler
from ingestion.indexer import RepoIndexer
from ingestion.embedding_service import EmbeddingService
from ingestion.health_scorer import HealthScorer
from db.connection import get_db_pool
from elasticsearch import AsyncElasticsearch
from prometheus_client import start_http_server, Counter, Histogram

log = structlog.get_logger()

# Prometheus metrics
REPOS_INDEXED = Counter('repos_indexed_total', 'Total repos indexed')
INDEX_DURATION = Histogram('indexing_duration_seconds', 'Time to index a batch of repos')
EMBEDDING_ERRORS = Counter('embedding_errors_total', 'Embedding computation failures')


async def run_ingestion_pipeline(limit_per_topic: int = 1000):
    """Main ingestion pipeline: crawl -> enrich -> embed -> index"""

    log.info("Starting ingestion pipeline", limit=limit_per_topic)

    db_pool = await get_db_pool()
    es = AsyncElasticsearch(os.getenv("ELASTICSEARCH_URL", "http://localhost:9200"))
    crawler = GitHubCrawler(token=os.getenv("GITHUB_TOKEN"))
    embedder = EmbeddingService()
    scorer = HealthScorer()
    indexer = RepoIndexer(db_pool=db_pool, es=es)

    # Ensure ES index exists with correct mapping
    await indexer.ensure_index_exists()

    # Topics to crawl — these seed the initial corpus
    SEED_TOPICS = [
        "spring-boot", "machine-learning", "deep-learning", "react",
        "fastapi", "kubernetes", "docker", "rust", "golang", "java",
        "python", "typescript", "data-science", "nlp", "llm",
        "microservices", "apache-kafka", "postgresql", "redis",
        "pytorch", "tensorflow", "nextjs", "android", "flutter",
    ]

    total_indexed = 0

    for topic in SEED_TOPICS:
        log.info("Crawling topic", topic=topic)
        repos = await crawler.fetch_repos_by_topic(topic, limit=limit_per_topic)

        # Process in batches of 50
        batch_size = 50
        for i in range(0, len(repos), batch_size):
            batch = repos[i:i + batch_size]

            with INDEX_DURATION.time():
                # 1. Fetch additional metadata (good_first_issues, readme)
                enriched = await crawler.enrich_repos(batch)

                # 2. Compute health scores
                scored = [scorer.compute(repo) for repo in enriched]

                # 3. Compute embeddings
                embeddings = await embedder.compute_repo_embeddings(scored)

                # 4. Persist to Postgres + Elasticsearch
                indexed_count = await indexer.bulk_index(list(zip(scored, embeddings)))
                total_indexed += indexed_count
                REPOS_INDEXED.inc(indexed_count)

        log.info("Topic complete", topic=topic, total_so_far=total_indexed)

    await db_pool.close()
    await es.close()
    log.info("Ingestion pipeline complete", total_indexed=total_indexed)


async def main():
    start_http_server(9100)  # Prometheus metrics endpoint

    # Run once immediately
    await run_ingestion_pipeline(limit_per_topic=200)

    # Then schedule nightly refresh
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_ingestion_pipeline,
        'cron',
        hour=2,
        minute=0,
        kwargs={'limit_per_topic': 1000}
    )
    scheduler.start()

    log.info("Ingestion service started. Next run: tonight at 02:00")
    await asyncio.Event().wait()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
