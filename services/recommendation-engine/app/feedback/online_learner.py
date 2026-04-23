"""
Online learning component.

When a user provides feedback (likes/dislikes), we nudge ONLY their personal
user embedding — not the full model.

Update rule:
  LIKED:    user_emb += lr * (repo_emb - user_emb) * like_weight
  DISLIKED: user_emb -= lr * (repo_emb - user_emb) * dislike_weight

Then L2-normalize and store.
"""

import numpy as np
import structlog
from typing import List

log = structlog.get_logger()

LEARNING_RATE = 0.05
LIKE_WEIGHT = 1.0
DISLIKE_WEIGHT = 0.7
MOMENTUM = 0.85


class OnlineEmbeddingUpdater:

    def __init__(self, db_pool):
        self.db_pool = db_pool

    async def update_user_embedding(
        self,
        user_id: str,
        liked_repo_ids: List[str],
        disliked_repo_ids: List[str],
    ):
        async with self.db_pool.acquire() as conn:
            # 1. Fetch current user embedding
            user_row = await conn.fetchrow(
                "SELECT embedding, version, feedback_count FROM user_embeddings WHERE user_id = $1",
                user_id
            )

            if user_row is None:
                stack_row = await conn.fetchrow(
                    "SELECT profile_embedding FROM user_stack_profiles WHERE user_id = $1",
                    user_id
                )
                if stack_row is None or stack_row["profile_embedding"] is None:
                    log.warning("No embedding found for user", user_id=user_id)
                    return
                user_emb = np.array(stack_row["profile_embedding"], dtype=np.float32)
                version = 1
                feedback_count = 0
            else:
                user_emb = np.array(user_row["embedding"], dtype=np.float32)
                version = user_row["version"]
                feedback_count = user_row["feedback_count"]

            original_emb = user_emb.copy()

            # 2. Fetch repo embeddings
            all_repo_ids = liked_repo_ids + disliked_repo_ids
            if not all_repo_ids:
                return

            repo_rows = await conn.fetch(
                "SELECT id::text, repo_embedding FROM repositories WHERE id = ANY($1::uuid[])",
                all_repo_ids
            )
            repo_emb_map = {
                row["id"]: np.array(row["repo_embedding"], dtype=np.float32)
                for row in repo_rows
                if row["repo_embedding"] is not None
            }

            # 3. Nudge toward likes
            for repo_id in liked_repo_ids:
                if repo_id in repo_emb_map:
                    delta = repo_emb_map[repo_id] - user_emb
                    user_emb += LEARNING_RATE * LIKE_WEIGHT * delta

            # 4. Nudge away from dislikes
            for repo_id in disliked_repo_ids:
                if repo_id in repo_emb_map:
                    delta = repo_emb_map[repo_id] - user_emb
                    user_emb -= LEARNING_RATE * DISLIKE_WEIGHT * delta

            # 5. L2 normalize
            norm = np.linalg.norm(user_emb)
            if norm > 1e-8:
                user_emb = user_emb / norm

            # 6. Momentum blend with original
            user_emb = MOMENTUM * user_emb + (1 - MOMENTUM) * original_emb
            user_emb = user_emb / (np.linalg.norm(user_emb) + 1e-8)

            # 7. Persist
            embedding_list = user_emb.tolist()
            await conn.execute(
                """
                INSERT INTO user_embeddings (user_id, embedding, version, feedback_count, updated_at)
                VALUES ($1, $2::vector, $3, $4, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    version = EXCLUDED.version,
                    feedback_count = EXCLUDED.feedback_count,
                    updated_at = NOW()
                """,
                user_id, embedding_list, version + 1, feedback_count + len(all_repo_ids)
            )

            log.info("User embedding updated",
                     user_id=user_id, version=version + 1,
                     liked=len(liked_repo_ids), disliked=len(disliked_repo_ids),
                     embedding_shift=float(np.linalg.norm(user_emb - original_emb)))
