from pydantic import BaseModel
from typing import List, Optional, Dict
from dataclasses import dataclass, field


class RepoCandidate(BaseModel):
    repo_id: str
    full_name: str
    description: Optional[str] = ""
    topics: List[str] = []
    primary_language: Optional[str] = ""
    stars: int = 0
    good_first_issues: int = 0
    health_score: float = 0.0
    has_contributing: bool = False
    html_url: str = ""


class RetrievalResult(BaseModel):
    repo_id: str
    score: float
    method: str  # BM25 | VECTOR


class Explanation(BaseModel):
    reason: str
    signal: str
    weight: float


class RecommendationItem(BaseModel):
    id: str
    rank: int
    match_score: float
    retrieval_method: str
    explanations: List[Explanation] = []
    repo: Dict = {}


class RecommendationFeed(BaseModel):
    items: List[RecommendationItem]
    session_id: str
    generated_at: str
    cold_start: bool = False
