import asyncio
import re
import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

log = structlog.get_logger()


@dataclass
class RawRepo:
    github_id: int
    full_name: str
    name: str
    description: Optional[str]
    html_url: str
    homepage: Optional[str]
    topics: List[str]
    languages: Dict[str, int]
    primary_language: Optional[str]
    stars: int
    forks: int
    open_issues: int
    watchers: int
    license: Optional[str]
    is_archived: bool
    is_fork: bool
    last_pushed_at: Optional[str]
    created_at_github: Optional[str]
    good_first_issues: int = 0
    has_contributing: bool = False
    readme_summary: str = ""
    health_score: float = 0.0


class GitHubCrawler:

    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        self.base_url = "https://api.github.com"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=30))
    async def fetch_repos_by_topic(self, topic: str, limit: int = 200) -> List[RawRepo]:
        """Fetch repos tagged with a GitHub topic, sorted by stars."""
        repos = []
        page = 1
        per_page = 100

        async with httpx.AsyncClient(headers=self.headers, timeout=30) as client:
            while len(repos) < limit:
                url = f"{self.base_url}/search/repositories"
                params = {
                    "q": f"topic:{topic} stars:>50 is:public archived:false",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": min(per_page, limit - len(repos)),
                    "page": page,
                }

                resp = await client.get(url, params=params)

                if resp.status_code == 429:
                    retry_after = int(resp.headers.get("Retry-After", 60))
                    log.warning("Rate limited", retry_after=retry_after)
                    await asyncio.sleep(retry_after)
                    continue

                resp.raise_for_status()
                data = resp.json()
                items = data.get("items", [])

                if not items:
                    break

                for item in items:
                    repos.append(self._parse_repo(item))

                if len(items) < per_page:
                    break

                page += 1
                await asyncio.sleep(2)

        return repos[:limit]

    async def enrich_repos(self, repos: List[RawRepo]) -> List[RawRepo]:
        """Fetch additional info: good first issues count, README summary."""
        async with httpx.AsyncClient(headers=self.headers, timeout=30) as client:
            tasks = [self._enrich_single(client, repo) for repo in repos]
            return await asyncio.gather(*tasks, return_exceptions=False)

    async def _enrich_single(self, client: httpx.AsyncClient, repo: RawRepo) -> RawRepo:
        try:
            contrib_resp = await client.head(
                f"{self.base_url}/repos/{repo.full_name}/contents/CONTRIBUTING.md"
            )
            repo.has_contributing = contrib_resp.status_code == 200

            issues_resp = await client.get(
                f"{self.base_url}/search/issues",
                params={
                    "q": f'repo:{repo.full_name} label:"good first issue" state:open',
                    "per_page": 1,
                }
            )
            if issues_resp.status_code == 200:
                repo.good_first_issues = issues_resp.json().get("total_count", 0)

            readme_resp = await client.get(
                f"{self.base_url}/repos/{repo.full_name}/readme",
                headers={**self.headers, "Accept": "application/vnd.github.raw+json"},
            )
            if readme_resp.status_code == 200:
                content = readme_resp.text
                clean = re.sub(r'[#*`\[\]!]', '', content)
                clean = re.sub(r'\n+', ' ', clean).strip()
                repo.readme_summary = clean[:500]

        except Exception as e:
            log.warning("Enrichment failed", repo=repo.full_name, error=str(e))

        return repo

    def _parse_repo(self, item: Dict[str, Any]) -> RawRepo:
        license_name = None
        if item.get("license"):
            license_name = item["license"].get("spdx_id")

        return RawRepo(
            github_id=item["id"],
            full_name=item["full_name"],
            name=item["name"],
            description=item.get("description"),
            html_url=item["html_url"],
            homepage=item.get("homepage"),
            topics=item.get("topics", []),
            languages={},
            primary_language=item.get("language"),
            stars=item.get("stargazers_count", 0),
            forks=item.get("forks_count", 0),
            open_issues=item.get("open_issues_count", 0),
            watchers=item.get("watchers_count", 0),
            license=license_name,
            is_archived=item.get("archived", False),
            is_fork=item.get("fork", False),
            last_pushed_at=item.get("pushed_at"),
            created_at_github=item.get("created_at"),
        )
