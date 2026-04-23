import json
import os
import numpy as np
import structlog
from typing import List, Tuple
from elasticsearch import AsyncElasticsearch
from ingestion.github_crawler import RawRepo

log = structlog.get_logger()

INDEX_NAME = "stackmatch-repos"
MAPPING_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "infra", "elasticsearch", "mappings", "repos.json")


class RepoIndexer:
    """Bulk upserts repos to both Postgres and Elasticsearch."""

    def __init__(self, db_pool, es: AsyncElasticsearch):
        self.db_pool = db_pool
        self.es = es

    async def ensure_index_exists(self):
        """Create ES index with mapping if it doesn't exist."""
        exists = await self.es.indices.exists(index=INDEX_NAME)
        if not exists:
            # Try local mapping file first, fall back to inline
            mapping = self._load_mapping()
            await self.es.indices.create(index=INDEX_NAME, body=mapping)
            log.info("Created ES index", index=INDEX_NAME)
        else:
            log.info("ES index already exists", index=INDEX_NAME)

    def _load_mapping(self) -> dict:
        """Load mapping from file or return default."""
        try:
            with open(MAPPING_PATH, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "mappings": {
                    "properties": {
                        "github_id": {"type": "long"},
                        "full_name": {"type": "keyword"},
                        "name": {"type": "text", "analyzer": "english"},
                        "description": {"type": "text", "analyzer": "english"},
                        "readme_summary": {"type": "text", "analyzer": "english"},
                        "topics": {"type": "keyword"},
                        "primary_language": {"type": "keyword"},
                        "languages": {"type": "keyword"},
                        "stars": {"type": "integer"},
                        "good_first_issues": {"type": "integer"},
                        "health_score": {"type": "float"},
                        "last_pushed_at": {"type": "date"},
                        "has_contributing": {"type": "boolean"},
                        "is_archived": {"type": "boolean"},
                        "combined_text": {"type": "text", "analyzer": "english"},
                    }
                },
                "settings": {"number_of_shards": 1, "number_of_replicas": 0},
            }

    async def bulk_index(self, repo_embedding_pairs: List[Tuple[RawRepo, np.ndarray]]) -> int:
        """Upsert repos to Postgres and Elasticsearch. Returns count of indexed repos."""
        indexed = 0

        async with self.db_pool.acquire() as conn:
            for repo, embedding in repo_embedding_pairs:
                try:
                    # Upsert to Postgres
                    embedding_list = embedding.tolist()
                    await conn.execute(
                        """
                        INSERT INTO repositories (
                            github_id, full_name, name, description, html_url, homepage,
                            topics, languages, primary_language, stars, forks, open_issues,
                            watchers, license, is_archived, is_fork, last_pushed_at,
                            created_at_github, good_first_issues, has_contributing,
                            readme_summary, health_score, repo_embedding, bm25_indexed
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6,
                            $7, $8::jsonb, $9, $10, $11, $12,
                            $13, $14, $15, $16, $17::timestamptz,
                            $18::timestamptz, $19, $20,
                            $21, $22, $23::vector, TRUE
                        )
                        ON CONFLICT (github_id) DO UPDATE SET
                            full_name = EXCLUDED.full_name,
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            stars = EXCLUDED.stars,
                            forks = EXCLUDED.forks,
                            open_issues = EXCLUDED.open_issues,
                            good_first_issues = EXCLUDED.good_first_issues,
                            has_contributing = EXCLUDED.has_contributing,
                            readme_summary = EXCLUDED.readme_summary,
                            health_score = EXCLUDED.health_score,
                            repo_embedding = EXCLUDED.repo_embedding,
                            last_pushed_at = EXCLUDED.last_pushed_at,
                            bm25_indexed = TRUE,
                            updated_at = NOW()
                        """,
                        repo.github_id, repo.full_name, repo.name,
                        repo.description, repo.html_url, repo.homepage,
                        repo.topics, json.dumps(repo.languages),
                        repo.primary_language, repo.stars, repo.forks,
                        repo.open_issues, repo.watchers, repo.license,
                        repo.is_archived, repo.is_fork,
                        repo.last_pushed_at, repo.created_at_github,
                        repo.good_first_issues, repo.has_contributing,
                        repo.readme_summary, repo.health_score, embedding_list,
                    )

                    # Index to Elasticsearch
                    combined_text = " ".join(filter(None, [
                        repo.name, repo.description,
                        " ".join(repo.topics) if repo.topics else None,
                        repo.readme_summary,
                    ]))

                    es_doc = {
                        "github_id": repo.github_id,
                        "full_name": repo.full_name,
                        "name": repo.name,
                        "description": repo.description or "",
                        "readme_summary": repo.readme_summary or "",
                        "topics": repo.topics,
                        "primary_language": repo.primary_language,
                        "languages": list(repo.languages.keys()) if repo.languages else [],
                        "stars": repo.stars,
                        "good_first_issues": repo.good_first_issues,
                        "health_score": repo.health_score,
                        "last_pushed_at": repo.last_pushed_at,
                        "has_contributing": repo.has_contributing,
                        "is_archived": repo.is_archived,
                        "combined_text": combined_text,
                    }

                    await self.es.index(
                        index=INDEX_NAME,
                        id=str(repo.github_id),
                        document=es_doc,
                    )

                    indexed += 1

                except Exception as e:
                    log.error("Failed to index repo", repo=repo.full_name, error=str(e))

        log.info("Batch indexed", count=indexed)
        return indexed
