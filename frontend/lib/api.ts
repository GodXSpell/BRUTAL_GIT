const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiGet(path: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  try {
    const res = await fetch(`${API_URL}${path}`, { headers, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function apiPost(path: string, body: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export type Intent = "CONTRIBUTOR" | "LEARNER" | "BUILDER";

export interface StackProfile {
  primaryLanguages: Array<{ name: string; weightPct: number }>;
  frameworks: Array<{ name: string; source: string; confidence: number }>;
  domains: string[];
  activityPattern: string | null;
  intent: string | null;
  totalRepos: number;
  totalStarsGiven: number;
  lastAnalyzedAt: string | null;
  githubProfile?: {
    username: string;
    avatarUrl: string;
    name: string | null;
    topRepos?: Array<{ name: string; url: string; stars: number }>;
  };
}

export interface RecommendationItem {
  id: string;
  rank: number;
  matchScore: number;
  explanations: Array<{ reason: string; signal: string; weight: number }>;
  repo: {
    id: string;
    fullName: string;
    name: string;
    description: string;
    htmlUrl: string;
    topics: string[];
    primaryLanguage: string;
    stars: number;
    forks: number;
    openIssues: number;
    goodFirstIssues: number;
    healthScore: number;
    hasContributing: boolean;
    lastPushedAt: string;
    license: string;
    homepage: string;
  };
}

export interface RecommendationFeed {
  items: RecommendationItem[];
  sessionId: string;
  generatedAt: string;
  coldStart: boolean;
}
