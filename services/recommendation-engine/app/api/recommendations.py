import uuid
import json
import numpy as np
import structlog
from datetime import datetime, timezone
from sentence_transformers import SentenceTransformer    
from fastapi import APIRouter, Query, HTTPException
from app.db.connection import get_db_pool
from app.search.elasticsearch_client import get_es
from app.search.hybrid_retriever import HybridRetriever
from app.models.recommendation import RecommendationFeed, RecommendationItem, Explanation

log = structlog.get_logger()

router = APIRouter()


@router.get("/recommendations")
async def get_recommendations(
    userId: str = Query(..., description="User UUID"),
    intent: str = Query("BUILDER", description="CONTRIBUTOR | LEARNER | BUILDER"),
    limit: int = Query(15, ge=1, le=50),
):
    """Generate personalized repo recommendations for a user."""
    db_pool = await get_db_pool()
    es = await get_es()

    # 1. Fetch user stack profile
    async with db_pool.acquire() as conn:
        stack_row = await conn.fetchrow(
            """
            SELECT primary_languages, frameworks, domains, activity_pattern, intent,
                   total_repos, total_stars_given
            FROM user_stack_profiles WHERE user_id = $1
            """,
            uuid.UUID(userId)
        )

        # 2. Fetch user embedding (prefer personalized, fall back to profile)
        emb_row = await conn.fetchrow(
            "SELECT embedding FROM user_embeddings WHERE user_id = $1",
            uuid.UUID(userId)
        )
        if emb_row is None:
            emb_row = await conn.fetchrow(
                "SELECT profile_embedding AS embedding FROM user_stack_profiles WHERE user_id = $1",
                uuid.UUID(userId)
            )

    cold_start = False
    if stack_row is None:
        raise HTTPException(status_code=404, detail="User stack profile not found. Trigger analysis first.")

    def parse_jsonb(val):
        if val is None:
            return []
        if isinstance(val, str):
            try:
                return json.loads(val)
            except:
                return []
        return val  # already a list/dict from asyncpg

    raw_langs = parse_jsonb(stack_row["primary_languages"])
    raw_frameworks = parse_jsonb(stack_row["frameworks"])
    raw_domains = parse_jsonb(stack_row["domains"])

    # Normalize to dicts
    if raw_langs and isinstance(raw_langs[0], str):
        primary_languages = [{"name": l, "weightPct": 1.0} for l in raw_langs]
    else:
        primary_languages = raw_langs

    if raw_frameworks and isinstance(raw_frameworks[0], str):
        frameworks = [{"name": f, "source": "github", "confidence": 1.0} for f in raw_frameworks]
    else:
        frameworks = raw_frameworks

    user_stack = {
        "primary_languages": primary_languages,
        "frameworks": frameworks,
        "domains": raw_domains if isinstance(raw_domains, list) else [],
        "activity_pattern": stack_row["activity_pattern"],
        "intent": stack_row["intent"],
    }

    if emb_row is None or emb_row["embedding"] is None:
        cold_start = True
        user_embedding = np.random.randn(128).astype(np.float32)
        user_embedding = user_embedding / (np.linalg.norm(user_embedding) + 1e-8)
    else:
        emb_val = emb_row["embedding"]
        if isinstance(emb_val, str):
            emb_val = json.loads(emb_val)
        user_embedding = np.array(emb_val, dtype=np.float32)
    
    # 3. Fetch previously shown repo IDs to exclude
    async with db_pool.acquire() as conn:
        prev_rows = await conn.fetch(
            """
            SELECT DISTINCT ri.repo_id::text
            FROM recommendation_items ri
            JOIN recommendation_sessions rs ON ri.session_id = rs.id
            WHERE rs.user_id = $1
            AND rs.created_at > NOW() - INTERVAL '2 hours'
            LIMIT 50
            """,
            uuid.UUID(userId)
        )
    exclude_ids = [row["repo_id"] for row in prev_rows]

    # 4. Run hybrid retrieval
    retriever = HybridRetriever(es=es, db_pool=db_pool)
    results = await retriever.retrieve(
        user_stack=user_stack,
        user_embedding=user_embedding,
        intent=intent,
        limit=limit,
        exclude_repo_ids=exclude_ids,
    )

    # 5. Persist recommendation session
    session_id = str(uuid.uuid4())
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO recommendation_sessions (id, user_id, intent, created_at)
            VALUES ($1, $2, $3, NOW())
            """,
            uuid.UUID(session_id), uuid.UUID(userId), intent
        )

        for i, repo in enumerate(results):
            method = "HYBRID"
            if repo.bm25_score > 0 and repo.vector_score == 0:
                method = "BM25"
            elif repo.vector_score > 0 and repo.bm25_score == 0:
                method = "VECTOR"

            await conn.execute(
                """
                INSERT INTO recommendation_items
                    (session_id, repo_id, rank_position, match_score, retrieval_method, explanation)
                VALUES ($1, $2, $3, $4, $5, $6::jsonb)
                """,
                uuid.UUID(session_id), uuid.UUID(repo.repo_id),
                i + 1, repo.final_score, method,
                json.dumps(repo.explanations),
            )

    # 6. Build response
    items = []
    for i, repo in enumerate(results):
        items.append(RecommendationItem(
            id=repo.repo_id,
            rank=i + 1,
            match_score=round(repo.final_score, 4),
            retrieval_method="HYBRID",
            explanations=[Explanation(**e) for e in repo.explanations],
            repo={
                "id": repo.repo_id,
                "fullName": repo.full_name,
                "name": repo.full_name.split("/")[-1] if "/" in repo.full_name else repo.full_name,
                "description": repo.description,
                "htmlUrl": repo.html_url,
                "topics": repo.topics,
                "primaryLanguage": repo.primary_language,
                "stars": repo.stars,
                "forks": repo.forks,
                "openIssues": repo.open_issues,
                "goodFirstIssues": repo.good_first_issues,
                "healthScore": repo.health_score,
                "hasContributing": repo.has_contributing,
                "lastPushedAt": repo.last_pushed_at,
                "license": repo.license,
                "homepage": repo.homepage,
            },
        ))

    return RecommendationFeed(
        items=items,
        session_id=session_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        cold_start=cold_start,
    )


@router.post("/embeddings/user")
async def compute_user_embedding(userId: str = Query(...)):
    """Compute/refresh user embedding from stack profile."""
    db_pool = await get_db_pool()

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT primary_languages, frameworks, domains FROM user_stack_profiles WHERE user_id = $1",
            uuid.UUID(userId)
        )

    if row is None:
        raise HTTPException(status_code=404, detail="Stack profile not found")

    # Build text — handle both string and dict formats
    parts = []
    for lw in (row["primary_languages"] or []):
        parts.append(lw if isinstance(lw, str) else lw.get("name", ""))
    for fw in (row["frameworks"] or []):
        parts.append(fw if isinstance(fw, str) else fw.get("name", ""))
    parts.extend(row["domains"] or [])
    stack_text = " ".join(filter(None, parts))

    model = SentenceTransformer("all-MiniLM-L6-v2")
    emb_384 = model.encode([stack_text], normalize_embeddings=True)[0]

    # Project to 128-dim
    np.random.seed(42)
    projection = np.random.randn(384, 128)
    projection, _ = np.linalg.qr(projection)
    emb_128 = emb_384 @ projection
    emb_128 = emb_128 / (np.linalg.norm(emb_128) + 1e-8)

    # Convert to pgvector string format
    embedding_str = '[' + ','.join(str(x) for x in emb_128.tolist()) + ']'

    async with db_pool.acquire() as conn:
        await conn.execute(
            "UPDATE user_stack_profiles SET profile_embedding = $1::vector WHERE user_id = $2",
            embedding_str, uuid.UUID(userId)
        )
        await conn.execute(
            """
            INSERT INTO user_embeddings (user_id, embedding, version, feedback_count, updated_at)
            VALUES ($1, $2::vector, 1, 0, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                embedding = EXCLUDED.embedding, updated_at = NOW()
            """,
            uuid.UUID(userId), embedding_str
        )

    return {"status": "ok", "userId": userId}