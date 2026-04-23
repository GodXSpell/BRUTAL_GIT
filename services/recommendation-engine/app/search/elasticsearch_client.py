import os
import structlog
from elasticsearch import AsyncElasticsearch

log = structlog.get_logger()

_es_client = None


async def init_es():
    global _es_client
    es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    _es_client = AsyncElasticsearch(es_url)
    info = await _es_client.info()
    log.info("Elasticsearch connected", version=info["version"]["number"])


async def get_es() -> AsyncElasticsearch:
    global _es_client
    if _es_client is None:
        await init_es()
    return _es_client
