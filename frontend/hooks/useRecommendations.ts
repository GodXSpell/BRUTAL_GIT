"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, RecommendationFeed, RecommendationItem, Intent } from "@/lib/api";

function generateMockRecommendations(username: string): RecommendationItem[] {
  return [
    {
      id: "repo_mock_1",
      rank: 1,
      matchScore: 0.95,
      explanations: [
        { reason: "High match with primary languages", signal: "LANG", weight: 0.5 },
        { reason: "Trending in your tech stack", signal: "TRENDING", weight: 0.3 }
      ],
      repo: {
        id: "12345",
        fullName: `${username}/system-crusher-v2`,
        name: "system-crusher-v2",
        description: "High-performance load testing framework built with memory-safe primitives. Designed to find breaking points in distributed architectures.",
        htmlUrl: `https://github.com/${username}/system-crusher-v2`,
        topics: ["rust", "distributed-systems", "load-testing"],
        primaryLanguage: "Rust",
        stars: 2400,
        forks: 342,
        openIssues: 12,
        goodFirstIssues: 4,
        healthScore: 92,
        hasContributing: true,
        lastPushedAt: new Date().toISOString(),
        license: "MIT",
        homepage: ""
      }
    },
    {
      id: "repo_mock_2",
      rank: 2,
      matchScore: 0.88,
      explanations: [
        { reason: "Great first issues for your skill level", signal: "BEGINNER_FRIENDLY", weight: 0.8 }
      ],
      repo: {
        id: "67890",
        fullName: `open-source/neural-mesh-go`,
        name: "neural-mesh-go",
        description: "Decentralized node communication protocol for edge AI deployment. Low latency, zero-trust architecture.",
        htmlUrl: `https://github.com/open-source/neural-mesh-go`,
        topics: ["go", "edge-ai", "decentralized", "p2p"],
        primaryLanguage: "Go",
        stars: 891,
        forks: 120,
        openIssues: 45,
        goodFirstIssues: 15,
        healthScore: 85,
        hasContributing: true,
        lastPushedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
        license: "Apache-2.0",
        homepage: "https://neuralmesh.dev"
      }
    }
  ];
}

export function useRecommendations(intent: Intent | null) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!intent) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("stackmatch_token");
      const userId = localStorage.getItem("stackmatch_user_id");

      if (!token || !userId) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const data: RecommendationFeed = await apiGet(
        `/api/v1/recommendations?userId=${userId}&intent=${intent}&limit=15`,
        token
      );
      setRecommendations(data.items);
      setSessionId(data.sessionId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [intent]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const recordFeedback = async (
    repoId: string,
    signal: "LIKE" | "DISLIKE" | "SKIP",
    rankPosition: number
  ) => {
    try {
      const token = localStorage.getItem("stackmatch_token");
      await apiPost(
        "/api/v1/feedback",
        { repoId, sessionId, signal, rankPosition },
        token || undefined
      );
    } catch (err) {
      console.error("Failed to record feedback:", err);
    }
  };

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
    recordFeedback,
  };
}
