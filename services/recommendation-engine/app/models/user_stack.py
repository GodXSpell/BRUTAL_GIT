from pydantic import BaseModel
from typing import List, Optional, Dict


class UserStackProfile(BaseModel):
    user_id: str
    primary_languages: List[Dict[str, object]]  # [{"name": "Java", "weightPct": 72.3}]
    frameworks: List[Dict[str, object]]          # [{"name": "Spring Boot", "source": "pom.xml", "confidence": 0.95}]
    domains: List[str]
    activity_pattern: Optional[str] = None
    intent: Optional[str] = None
    total_repos: int = 0
    total_stars_given: int = 0
