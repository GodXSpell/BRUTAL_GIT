import os
import asyncpg
import structlog

log = structlog.get_logger()

_pool = None


async def init_db():
    global _pool
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://stackmatch:stackmatch_secret@localhost:5432/stackmatch"
    )
    _pool = await asyncpg.create_pool(
        database_url,
        min_size=5,
        max_size=20,
        command_timeout=30,
    )
    async with _pool.acquire() as conn:
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    log.info("Database pool initialized")


async def get_db_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        await init_db()
    return _pool
