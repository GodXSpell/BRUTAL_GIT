import numpy as np
import structlog
from sentence_transformers import SentenceTransformer
from typing import List
from ingestion.github_crawler import RawRepo

log = structlog.get_logger()


class EmbeddingService:
    """
    Computes 128-dim sentence embeddings for repos.
    Uses all-MiniLM-L6-v2 (384-dim) projected down to 128-dim via QR decomposition.
    """

    NATIVE_DIM = 384
    TARGET_DIM = 128

    def __init__(self):
        log.info("Loading sentence transformer model...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.projection = None
        log.info("Model loaded")

    def _build_repo_text(self, repo: RawRepo) -> str:
        parts = []
        if repo.name:
            parts.append(repo.name.replace("-", " ").replace("_", " "))
            parts.append(repo.name.replace("-", " ").replace("_", " "))
        if repo.description:
            parts.append(repo.description)
        if repo.topics:
            parts.append(" ".join(repo.topics))
        if repo.primary_language:
            parts.append(repo.primary_language)
        if repo.readme_summary:
            parts.append(repo.readme_summary[:200])
        return " ".join(parts)

    async def compute_repo_embeddings(self, repos: List[RawRepo]) -> List[np.ndarray]:
        """Batch compute 128-dim embeddings for a list of repos."""
        texts = [self._build_repo_text(r) for r in repos]

        embeddings_384 = self.model.encode(
            texts,
            batch_size=64,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        if self.projection is None:
            np.random.seed(42)
            self.projection = np.random.randn(self.NATIVE_DIM, self.TARGET_DIM)
            self.projection, _ = np.linalg.qr(self.projection)

        embeddings_128 = embeddings_384 @ self.projection
        norms = np.linalg.norm(embeddings_128, axis=1, keepdims=True)
        embeddings_128 = embeddings_128 / (norms + 1e-8)

        return [embeddings_128[i] for i in range(len(repos))]

    def compute_user_embedding(self, stack_text: str) -> np.ndarray:
        """Compute embedding for a user's stack profile text."""
        emb_384 = self.model.encode([stack_text], normalize_embeddings=True)[0]
        if self.projection is None:
            np.random.seed(42)
            self.projection = np.random.randn(self.NATIVE_DIM, self.TARGET_DIM)
            self.projection, _ = np.linalg.qr(self.projection)
        emb_128 = emb_384 @ self.projection
        emb_128 = emb_128 / (np.linalg.norm(emb_128) + 1e-8)
        return emb_128
