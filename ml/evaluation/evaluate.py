"""
Offline evaluation script for the Two-Tower model.
Metrics: Recall@K, NDCG@K, MRR
"""

import torch
import numpy as np
import logging
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from two_tower.model import TwoTowerModel

log = logging.getLogger(__name__)


def ndcg_at_k(sim_matrix: torch.Tensor, k: int) -> float:
    """Normalized Discounted Cumulative Gain at K."""
    n = sim_matrix.shape[0]
    labels = torch.arange(n)
    top_k = sim_matrix.topk(k, dim=1).indices

    dcg = 0.0
    for i in range(n):
        for j in range(k):
            if top_k[i, j] == labels[i]:
                dcg += 1.0 / np.log2(j + 2)
                break

    idcg = n * (1.0 / np.log2(2))  # ideal: always rank 1
    return dcg / idcg


def mrr(sim_matrix: torch.Tensor) -> float:
    """Mean Reciprocal Rank."""
    n = sim_matrix.shape[0]
    labels = torch.arange(n)
    rankings = sim_matrix.argsort(dim=1, descending=True)

    total_rr = 0.0
    for i in range(n):
        rank = (rankings[i] == labels[i]).nonzero(as_tuple=True)[0].item() + 1
        total_rr += 1.0 / rank

    return total_rr / n


def evaluate(checkpoint_path: str = "ml/checkpoints/two_tower_best.pt"):
    device = torch.device("cpu")
    model = TwoTowerModel().to(device)

    # Load checkpoint
    path = Path(checkpoint_path)
    if not path.exists():
        log.error(f"Checkpoint not found: {path}")
        return

    checkpoint = torch.load(path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    log.info(f"Loaded model from epoch {checkpoint['epoch']}")
    log.info(f"Training Recall@10: {checkpoint.get('recall_at_10', 'N/A')}")

    # Generate test data (replace with real data)
    N_TEST = 1000
    user_feats = np.random.randn(N_TEST, TwoTowerModel.USER_INPUT_DIM).astype(np.float32)
    item_feats = np.random.randn(N_TEST, TwoTowerModel.ITEM_INPUT_DIM).astype(np.float32)

    with torch.no_grad():
        user_embs = model.get_user_embedding(torch.FloatTensor(user_feats))
        item_embs = model.get_item_embedding(torch.FloatTensor(item_feats))
        sim_matrix = torch.matmul(user_embs, item_embs.T)

    # Compute metrics
    for k in [1, 5, 10, 20, 50]:
        top_k = sim_matrix.topk(k, dim=1).indices
        labels = torch.arange(N_TEST)
        hits = (top_k == labels.unsqueeze(1)).any(dim=1).float()
        recall = hits.mean().item()
        log.info(f"Recall@{k}: {recall:.4f}")

    for k in [5, 10, 20]:
        score = ndcg_at_k(sim_matrix, k)
        log.info(f"NDCG@{k}: {score:.4f}")

    mrr_score = mrr(sim_matrix)
    log.info(f"MRR: {mrr_score:.4f}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    evaluate()
