import math
from datetime import datetime, timezone
from ingestion.github_crawler import RawRepo


class HealthScorer:
    """
    Computes a 0.0-1.0 health score for a repo based on activity signals.

    Signals and weights:
      - Recency of last push:    30%
      - Stars (log-normalized):  25%
      - Open issues (activity):  15%
      - Good first issues:       10%
      - Has CONTRIBUTING.md:     10%
      - Not archived:            10%
    """

    def compute(self, repo: RawRepo) -> RawRepo:
        score = 0.0

        # 1. Recency (30%)
        if repo.last_pushed_at:
            try:
                pushed = datetime.fromisoformat(repo.last_pushed_at.replace("Z", "+00:00"))
                days_since = (datetime.now(timezone.utc) - pushed).days
                if days_since <= 30:
                    score += 0.30
                elif days_since <= 90:
                    score += 0.24
                elif days_since <= 180:
                    score += 0.15
                elif days_since <= 365:
                    score += 0.07
            except Exception:
                pass

        # 2. Stars (25%)
        star_score = min(1.0, math.log1p(repo.stars) / math.log1p(50000))
        score += 0.25 * star_score

        # 3. Open issues as activity signal (15%)
        if 10 <= repo.open_issues <= 200:
            score += 0.15
        elif repo.open_issues > 0:
            score += 0.07

        # 4. Good first issues (10%)
        if repo.good_first_issues > 0:
            score += min(0.10, repo.good_first_issues * 0.02)

        # 5. Has CONTRIBUTING.md (10%)
        if repo.has_contributing:
            score += 0.10

        # 6. Not archived (10%)
        if not repo.is_archived:
            score += 0.10

        repo.health_score = round(min(1.0, score), 4)
        return repo
