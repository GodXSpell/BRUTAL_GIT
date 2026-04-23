import asyncio
import time
import numpy as np
import structlog
from typing import List, Optional, Tuple
from dataclasses import dataclass, field
from elasticsearch import AsyncElasticsearch

log = structlog.get_logger()


@dataclass
class ScoredRepo:
    repo_id: str
    full_name: str
    description: str
    topics: List[str]
    primary_language: str
    languages: dict
    stars: int
    forks: int
    good_first_issues: int
    health_score: float
    has_contributing: bool
    last_pushed_at: Optional[str]
    html_url: str
    readme_summary: str
    open_issues: int = 0
    license: Optional[str] = None
    homepage: Optional[str] = None
    bm25_score: float = 0.0
    vector_score: float = 0.0
    rrf_score: float = 0.0
    final_score: float = 0.0
    retrieval_rank: int = 0
    explanations: List[dict] = field(default_factory=list)


class HybridRetriever:
    """
    Two-stage hybrid retrieval:
      Stage 1: BM25 (Elasticsearch) + ANN (pgvector) -> candidate set
      Stage 2: RRF fusion + feature-based re-ranking -> final ranked list
    """

    RRF_K = 60
    CANDIDATE_POOL_SIZE = 100

    def __init__(self, es: AsyncElasticsearch, db_pool):
        self.es = es
        self.db_pool = db_pool

    async def retrieve(
        self,
        user_stack: dict,
        user_embedding: np.ndarray,
        intent: str,
        limit: int = 15,
        exclude_repo_ids: Optional[List[str]] = None,
    ) -> List[ScoredRepo]:
        exclude_ids = exclude_repo_ids or []
        t0 = time.time()

        # Stage 1: Parallel retrieval
        bm25_results, vector_results = await asyncio.gather(
            self._bm25_retrieve(user_stack, intent),
            self._vector_retrieve(user_embedding, user_stack.get("primary_languages", [])),
        )

        t1 = time.time()
        log.info("Stage 1 retrieval complete",
                 bm25_count=len(bm25_results),
                 vector_count=len(vector_results),
                 duration_ms=round((t1 - t0) * 1000, 1))

        # Stage 2: RRF Fusion
        fused = self._reciprocal_rank_fusion(bm25_results, vector_results)
        fused = [r for r in fused if r not in exclude_ids]

        # Fetch full repo data for fused candidates
        repo_data = await self._fetch_repo_data(fused[:self.CANDIDATE_POOL_SIZE])

        # Stage 3: Feature-based re-ranking
        reranked = self._rerank(repo_data, user_stack, intent,
                                {rid: s for rid, s in bm25_results},
                                {rid: s for rid, s in vector_results},
                                {rid: score for rid, score in zip(fused, [self._rrf_scores.get(rid, 0) for rid in fused])})

        # Stage 4: Generate explanations
        final = self._add_explanations(reranked[:limit], user_stack, intent)

        t2 = time.time()
        log.info("Full retrieval pipeline complete",
                 total_duration_ms=round((t2 - t0) * 1000, 1),
                 returned=len(final))

        return final

    async def _bm25_retrieve(self, user_stack: dict, intent: str) -> List[Tuple[str, float]]:
        should_clauses = []

        top_langs = [lw.get("name", "") for lw in user_stack.get("primary_languages", [])[:3]]
        for lang in top_langs:
            should_clauses.append({
                "term": {"primary_language": {"value": lang, "boost": 3.0}}
            })

        framework_names = [fw.get("name", "") for fw in user_stack.get("frameworks", [])[:5]]
        if framework_names:
            should_clauses.append({
                "multi_match": {
                    "query": " ".join(framework_names),
                    "fields": ["topics^2", "description", "readme_summary", "name"],
                    "boost": 2.5,
                }
            })

        for domain in user_stack.get("domains", []):
            should_clauses.append({
                "term": {"topics": {"value": domain.lower(), "boost": 1.5}}
            })

        if intent == "CONTRIBUTOR":
            should_clauses.append({
                "range": {"good_first_issues": {"gte": 1, "boost": 2.0}}
            })
        elif intent == "LEARNER":
            for term in ["tutorial", "learning", "beginner", "course", "awesome"]:
                should_clauses.append({
                    "term": {"topics": {"value": term, "boost": 1.5}}
                })

        lang_filter = {"terms": {"primary_language": top_langs}} if top_langs else {"match_all": {}}

        query = {
            "bool": {
                "must": [
                    {"term": {"is_archived": False}},
                    {"range": {"stars": {"gte": 50}}},
                    {"range": {"health_score": {"gte": 0.3}}},
                ],
                "should": should_clauses,
                "minimum_should_match": 1,
                "filter": [lang_filter]
            }
        }

        try:
            resp = await self.es.search(
                index="stackmatch-repos",
                body={"query": query, "size": self.CANDIDATE_POOL_SIZE, "_source": ["github_id"]},
            )
            return [
                (str(hit["_source"]["github_id"]), hit["_score"])
                for hit in resp["hits"]["hits"]
            ]
        except Exception as e:
            log.error("BM25 retrieval failed", error=str(e))
            return []

    async def _vector_retrieve(self, user_embedding: np.ndarray, primary_languages: list) -> List[Tuple[str, float]]:
        top_langs = [lw.get("name", "") for lw in primary_languages[:4]]
        embedding_list = user_embedding.tolist()

        lang_filter = ""
        params = [embedding_list]

        if top_langs:
            lang_filter = f"AND primary_language = ANY($2::text[])"
            params.append(top_langs)

        query = f"""
            SELECT
                id::text,
                1 - (repo_embedding <=> $1::vector) AS cosine_similarity
            FROM repositories
            WHERE
                repo_embedding IS NOT NULL
                AND is_archived = false
                AND health_score >= 0.3
                AND stars >= 50
                {lang_filter}
            ORDER BY repo_embedding <=> $1::vector
            LIMIT {self.CANDIDATE_POOL_SIZE}
        """

        try:
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch(query, *params)
            return [(row["id"], float(row["cosine_similarity"])) for row in rows]
        except Exception as e:
            log.error("Vector retrieval failed", error=str(e))
            return []

    def _reciprocal_rank_fusion(
        self,
        bm25_results: List[Tuple[str, float]],
        vector_results: List[Tuple[str, float]],
    ) -> List[str]:
        self._rrf_scores = {}

        for rank, (repo_id, _) in enumerate(bm25_results, start=1):
            self._rrf_scores[repo_id] = self._rrf_scores.get(repo_id, 0.0) + 1.0 / (self.RRF_K + rank)

        for rank, (repo_id, _) in enumerate(vector_results, start=1):
            self._rrf_scores[repo_id] = self._rrf_scores.get(repo_id, 0.0) + 1.0 / (self.RRF_K + rank)

        return sorted(self._rrf_scores.keys(), key=lambda x: self._rrf_scores[x], reverse=True)

    async def _fetch_repo_data(self, repo_ids: List[str]) -> List[ScoredRepo]:
        if not repo_ids:
            return []

        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id::text, full_name, name, description, html_url, homepage,
                       topics, languages, primary_language, stars, forks, open_issues,
                       watchers, license, good_first_issues, has_contributing,
                       health_score, last_pushed_at::text, readme_summary
                FROM repositories
                WHERE id = ANY($1::uuid[])
                """,
                repo_ids
            )

        repos = []
        for row in rows:
            import json
            langs = row["languages"] if isinstance(row["languages"], dict) else {}
            repos.append(ScoredRepo(
                repo_id=row["id"],
                full_name=row["full_name"],
                description=row["description"] or "",
                topics=row["topics"] or [],
                primary_language=row["primary_language"] or "",
                languages=langs,
                stars=row["stars"],
                forks=row["forks"],
                good_first_issues=row["good_first_issues"],
                health_score=row["health_score"],
                has_contributing=row["has_contributing"],
                last_pushed_at=row["last_pushed_at"],
                html_url=row["html_url"],
                readme_summary=row["readme_summary"] or "",
                open_issues=row["open_issues"],
                license=row["license"],
                homepage=row["homepage"],
            ))
        return repos

    def _rerank(self, candidates: List[ScoredRepo], user_stack: dict, intent: str,
                bm25_lookup: dict, vector_lookup: dict, rrf_lookup: dict) -> List[ScoredRepo]:
        user_langs = {lw.get("name", "").lower() for lw in user_stack.get("primary_languages", [])}
        user_topics = {fw.get("name", "").lower() for fw in user_stack.get("frameworks", [])}
        user_topics.update({d.lower() for d in user_stack.get("domains", [])})

        for repo in candidates:
            feature_score = 0.0
            repo.bm25_score = bm25_lookup.get(repo.repo_id, 0.0)
            repo.vector_score = vector_lookup.get(repo.repo_id, 0.0)
            repo.rrf_score = rrf_lookup.get(repo.repo_id, self._rrf_scores.get(repo.repo_id, 0.0))

            if repo.primary_language and repo.primary_language.lower() in user_langs:
                feature_score += 0.30
            elif any(lang.lower() in user_langs for lang in repo.languages.keys()):
                feature_score += 0.15

            repo_topics = {t.lower() for t in repo.topics}
            overlap = repo_topics & user_topics
            topic_score = min(1.0, len(overlap) / max(1, len(user_topics))) * 0.30
            feature_score += topic_score

            if intent == "CONTRIBUTOR":
                if repo.has_contributing: feature_score += 0.10
                if repo.good_first_issues > 0: feature_score += 0.10
            elif intent == "LEARNER":
                if repo_topics & {"tutorial", "learning", "beginner", "course", "awesome"}:
                    feature_score += 0.20
            elif intent == "BUILDER":
                if repo.stars > 1000: feature_score += 0.10
                if any(t in repo_topics for t in {"library", "framework", "tool", "sdk"}):
                    feature_score += 0.10

            feature_score += 0.20 * repo.health_score

            normalized_rrf = min(1.0, repo.rrf_score * 30)
            repo.final_score = 0.40 * normalized_rrf + 0.60 * feature_score

        return sorted(candidates, key=lambda r: r.final_score, reverse=True)

    def _add_explanations(self, repos: List[ScoredRepo], user_stack: dict, intent: str) -> List[ScoredRepo]:
        user_langs = {lw.get("name", "") for lw in user_stack.get("primary_languages", [])}
        user_frameworks = {fw.get("name", "") for fw in user_stack.get("frameworks", [])}

        for repo in repos:
            explanations = []

            if repo.primary_language in user_langs:
                explanations.append({
                    "reason": f"Written in {repo.primary_language}, your primary language",
                    "signal": "language_match", "weight": 0.30,
                })

            repo_topics_set = set(repo.topics)
            matched_frameworks = user_frameworks & repo_topics_set
            if matched_frameworks:
                fw_list = ", ".join(list(matched_frameworks)[:2])
                explanations.append({
                    "reason": f"Related to {fw_list} — tools you use",
                    "signal": "framework_match", "weight": 0.30,
                })

            if intent == "CONTRIBUTOR" and repo.good_first_issues > 0:
                explanations.append({
                    "reason": f"{repo.good_first_issues} open good-first issues",
                    "signal": "contributor_friendly", "weight": 0.20,
                })
            elif intent == "LEARNER" and set(repo.topics) & {"tutorial", "learning", "beginner"}:
                explanations.append({
                    "reason": "Tagged as learning-friendly content",
                    "signal": "learner_friendly", "weight": 0.20,
                })

            if repo.health_score > 0.7:
                explanations.append({
                    "reason": "Actively maintained — recent commits and good community",
                    "signal": "high_health", "weight": 0.20,
                })

            if intent == "BUILDER" and repo.stars > 5000:
                explanations.append({
                    "reason": f"Battle-tested — {repo.stars:,} stars in production use",
                    "signal": "high_adoption", "weight": 0.15,
                })

            repo.explanations = explanations[:3]

        return repos
