"""
Training script for the Two-Tower model.

For cold start: use GitHub stars as implicit positive signal.
  positive pair = (user_stack_features, starred_repo_features)
"""

import torch
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
import logging
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from two_tower.model import TwoTowerModel, InBatchContrastiveLoss

log = logging.getLogger(__name__)


class StarInteractionDataset(Dataset):
    """Dataset of (user_features, repo_features) pairs from GitHub stars."""

    def __init__(self, user_features: np.ndarray, repo_features: np.ndarray):
        assert len(user_features) == len(repo_features)
        self.user_features = torch.FloatTensor(user_features)
        self.repo_features = torch.FloatTensor(repo_features)

    def __len__(self):
        return len(self.user_features)

    def __getitem__(self, idx):
        return self.user_features[idx], self.repo_features[idx]


def train_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss = 0.0

    for batch_idx, (user_feats, item_feats) in enumerate(loader):
        user_feats = user_feats.to(device)
        item_feats = item_feats.to(device)

        optimizer.zero_grad()
        user_emb, item_emb, logits = model(user_feats, item_feats)
        loss = criterion(logits)
        loss.backward()

        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item()

        if batch_idx % 100 == 0:
            log.info(f"Batch {batch_idx}/{len(loader)}, Loss: {loss.item():.4f}")

    return total_loss / len(loader)


def evaluate_recall_at_k(model, user_feats, item_feats, k_values=[5, 10, 20]):
    """Offline evaluation: Recall@K."""
    model.eval()
    with torch.no_grad():
        user_embs = model.get_user_embedding(torch.FloatTensor(user_feats))
        item_embs = model.get_item_embedding(torch.FloatTensor(item_feats))

        sim_matrix = torch.matmul(user_embs, item_embs.T)

        results = {}
        for k in k_values:
            top_k = sim_matrix.topk(k, dim=1).indices
            labels = torch.arange(len(user_feats))
            hits = (top_k == labels.unsqueeze(1)).any(dim=1).float()
            results[f"Recall@{k}"] = hits.mean().item()

    return results


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    log.info(f"Training on: {device}")

    BATCH_SIZE = 512
    EPOCHS = 20
    LR = 3e-4
    WEIGHT_DECAY = 1e-5

    model = TwoTowerModel().to(device)
    criterion = InBatchContrastiveLoss()
    optimizer = optim.Adam(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    # Placeholder random data — replace with actual data loading from DB
    N = 10000
    user_features = np.random.randn(N, TwoTowerModel.USER_INPUT_DIM).astype(np.float32)
    repo_features = np.random.randn(N, TwoTowerModel.ITEM_INPUT_DIM).astype(np.float32)

    train_size = int(0.9 * N)
    train_dataset = StarInteractionDataset(user_features[:train_size], repo_features[:train_size])
    val_user = user_features[train_size:]
    val_repo = repo_features[train_size:]

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=4)

    best_recall = 0.0
    save_path = Path("ml/checkpoints/two_tower_best.pt")
    save_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(EPOCHS):
        avg_loss = train_epoch(model, train_loader, optimizer, criterion, device)
        recall_metrics = evaluate_recall_at_k(model, val_user, val_repo)
        scheduler.step()

        log.info(f"Epoch {epoch+1}/{EPOCHS} | Loss: {avg_loss:.4f} | {recall_metrics}")

        if recall_metrics["Recall@10"] > best_recall:
            best_recall = recall_metrics["Recall@10"]
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "recall_at_10": best_recall,
                "loss": avg_loss,
            }, save_path)
            log.info(f"New best model saved. Recall@10: {best_recall:.4f}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
