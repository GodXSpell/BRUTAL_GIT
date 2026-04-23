import torch
import torch.nn as nn
import torch.nn.functional as F
from dataclasses import dataclass


@dataclass
class TowerConfig:
    input_dim: int
    hidden_dims: list
    output_dim: int = 128
    dropout: float = 0.1
    batch_norm: bool = True


class Tower(nn.Module):
    """
    Single tower: maps high-dim sparse features -> dense embedding.
    Architecture: Input -> [Linear -> BN -> ReLU -> Dropout] x N -> L2-normalized output
    """

    def __init__(self, config: TowerConfig):
        super().__init__()
        layers = []
        in_dim = config.input_dim

        for hidden_dim in config.hidden_dims:
            layers.append(nn.Linear(in_dim, hidden_dim))
            if config.batch_norm:
                layers.append(nn.BatchNorm1d(hidden_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(config.dropout))
            in_dim = hidden_dim

        layers.append(nn.Linear(in_dim, config.output_dim))
        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.net(x)
        return F.normalize(out, p=2, dim=-1)


class TwoTowerModel(nn.Module):
    """
    Two-Tower retrieval model for repo recommendations.

    User Tower input (88-dim):
      - Language one-hot/weights (top 20 languages)
      - Framework one-hot (top 50 frameworks)
      - Domain one-hot (10 domains)
      - Activity pattern one-hot (3)
      - Intent one-hot (3)
      - Total repos + stars given (2 normalized scalars)

    Item Tower input (252-dim):
      - Language one-hot (top 20 languages)
      - Topic multi-hot (top 100 topics)
      - Health score + log-stars + has_contributing + good_first_issues (4 scalars)
      - Sentence embedding of description+topics (128-dim)

    Training: In-batch softmax contrastive loss
    """

    USER_INPUT_DIM = 20 + 50 + 10 + 3 + 3 + 2  # = 88
    ITEM_INPUT_DIM = 20 + 100 + 4 + 128          # = 252

    def __init__(self):
        super().__init__()

        self.user_tower = Tower(TowerConfig(
            input_dim=self.USER_INPUT_DIM,
            hidden_dims=[256, 128],
            output_dim=128,
            dropout=0.15,
        ))

        self.item_tower = Tower(TowerConfig(
            input_dim=self.ITEM_INPUT_DIM,
            hidden_dims=[256, 128],
            output_dim=128,
            dropout=0.15,
        ))

        self.temperature = nn.Parameter(torch.tensor(0.07))

    def forward(self, user_features, item_features):
        user_emb = self.user_tower(user_features)
        item_emb = self.item_tower(item_features)
        logits = torch.matmul(user_emb, item_emb.T) / self.temperature.exp()
        return user_emb, item_emb, logits

    def get_user_embedding(self, user_features):
        return self.user_tower(user_features)

    def get_item_embedding(self, item_features):
        return self.item_tower(item_features)


class InBatchContrastiveLoss(nn.Module):
    """
    In-batch softmax contrastive loss.
    Positive pair = (user_i, repo_i). All other repos in batch are negatives.
    Equivalent to cross-entropy on the cosine similarity matrix.
    """

    def forward(self, logits: torch.Tensor) -> torch.Tensor:
        batch_size = logits.shape[0]
        labels = torch.arange(batch_size, device=logits.device)
        loss_u2i = F.cross_entropy(logits, labels)
        loss_i2u = F.cross_entropy(logits.T, labels)
        return (loss_u2i + loss_i2u) / 2.0
