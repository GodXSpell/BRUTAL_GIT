// "use client";
// import { useState, useEffect } from "react";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// export interface StackProfile {
//   primaryLanguages: Array<{ name: string; weightPct: number }>;
//   frameworks: Array<{ name: string; source: string; confidence: number }>;
//   domains: string[];
//   activityPattern: string | null;
//   intent: string | null;
//   totalRepos: number;
//   totalStarsGiven: number;
//   lastAnalyzedAt: string | null;
//   githubProfile?: {
//     username: string;
//     avatarUrl: string;
//     name: string | null;
//   };
// }

// export function useUserStack() {
//   const [stack, setStack] = useState<StackProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchAll() {
//       const token = localStorage.getItem("stackmatch_token");
//       if (!token) {
//         setError("Not authenticated");
//         setLoading(false);
//         return;
//       }

//       try {
//         // Fetch user profile (for avatar, username)
//         const meRes = await fetch(`${API_URL}/api/v1/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // Fetch stack profile
//         const stackRes = await fetch(`${API_URL}/api/v1/me/stack`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!meRes.ok || !stackRes.ok) {
//           throw new Error(
//             `API error: me=${meRes.status} stack=${stackRes.status}`,
//           );
//         }

//         const me = await meRes.json();
//         const stackData = await stackRes.json();

//         console.log("me response:", me);
//         console.log("stack response:", stackData);

//         const userId = me.id || me.userId || me.githubId?.toString();
//         if (userId) localStorage.setItem("stackmatch_user_id", userId);

//         setStack({
//           primaryLanguages: stackData.primaryLanguages || [],
//           frameworks: stackData.frameworks || [],
//           domains: stackData.domains || [],
//           activityPattern: stackData.activityPattern || null,
//           intent: stackData.intent || null,
//           totalRepos: stackData.totalRepos || 0,
//           totalStarsGiven: stackData.totalStarsGiven || 0,
//           lastAnalyzedAt: stackData.lastAnalyzedAt || null,
//           githubProfile: {
//             username: me.githubLogin || "",
//             avatarUrl: me.githubAvatar || "",
//             name: me.githubName || null,
//           },
//         });
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAll();
//   }, []);

//   return { stack, loading, error };
// } 
// "use client";
// import { StackProfile } from "@/lib/api";
// import { useState, useEffect, useCallback } from "react";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// const MAX_RETRIES = 5;
// const RETRY_DELAY_MS = 3000; // retry every 3 seconds

// export function useUserStack() {
//   const [stack, setStack] = useState<StackProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchAll = useCallback(async (attempt = 1) => {
//     const token = localStorage.getItem("stackmatch_token");
//     if (!token) {
//       setError("Not authenticated");
//       setLoading(false);
//       return;
//     }

//     try {
//       const stackRes = await fetch(`${API_URL}/api/v1/me/stack`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // If service is not ready yet, retry
//       if (
//         stackRes.status === 502 ||
//         stackRes.status === 503 ||
//         stackRes.status === 504
//       ) {
//         throw new Error(`Service unavailable (${stackRes.status})`);
//       }

//       if (!stackRes.ok) {
//         throw new Error(`API error: stack=${stackRes.status}`);
//       }

//       const data = await stackRes.json();
//       const sp = data.stackProfile;

//       if (!sp) throw new Error("stackProfile missing from response");

//       if (data.userId) localStorage.setItem("stackmatch_user_id", data.userId);

//       setStack({
//         primaryLanguages: sp.primaryLanguages || [],
//         frameworks: sp.frameworks || [],
//         domains: sp.domains || [],
//         activityPattern: sp.activityPattern || null,
//         intent: sp.intent || null,
//         totalRepos: sp.totalRepos || 0,
//         totalStarsGiven: sp.totalStarsGiven || 0,
//         lastAnalyzedAt: sp.lastAnalyzedAt || null,
//         githubProfile: {
//           username: data.githubLogin || "",
//           avatarUrl: data.githubAvatar || "",
//           name: data.githubName || null,
//         },
//       });

//       setError(null); // clear any previous retry errors
//     } catch (err: any) {
//       if (attempt < MAX_RETRIES) {
//         console.warn(
//           `Stack fetch failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS}ms...`,
//           err.message,
//         );
//         setTimeout(() => fetchAll(attempt + 1), RETRY_DELAY_MS);
//         return; // don't setLoading(false) yet — still retrying
//       }
//       // All retries exhausted
//       setError(err.message);
//     } finally {
//       // Only stop loading spinner after success or all retries exhausted
//       if (attempt >= MAX_RETRIES) setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAll(1).then(() => setLoading(false));
//   }, [fetchAll]);

//   return { stack, loading, error };
// }

// export type { StackProfile };
"use client";
import { StackProfile } from "@/lib/api";
import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export function useUserStack() {
  const [stack, setStack] = useState<StackProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tracks whether the token has landed in localStorage yet
  const [tokenReady, setTokenReady] = useState(false);

  // Bug 1 fix: Poll for token so we don't race with page.tsx's useEffect
  useEffect(() => {
    const token = localStorage.getItem("stackmatch_token");
    if (token) {
      setTokenReady(true);
      return;
    }
    // Token not there yet — poll every 200ms until it appears (max 5s)
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 200;
      if (localStorage.getItem("stackmatch_token")) {
        setTokenReady(true);
        clearInterval(interval);
      } else if (elapsed >= 5000) {
        setError("Not authenticated");
        setLoading(false);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = useCallback(async (attempt = 1) => {
    const token = localStorage.getItem("stackmatch_token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(`Service unavailable (${res.status})`);
      }
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const me = await res.json();
      const sp = me.stackProfile;

      if (!sp) throw new Error("stackProfile missing from response");
      if (me.userId) localStorage.setItem("stackmatch_user_id", me.userId);

      setStack({
        primaryLanguages: sp.primaryLanguages || [],
        frameworks: sp.frameworks || [],
        domains: sp.domains || [],
        activityPattern: sp.activityPattern || null,
        intent: sp.intent || null,
        totalRepos: sp.totalRepos || 0,
        totalStarsGiven: sp.totalStarsGiven || 0,
        lastAnalyzedAt: sp.lastAnalyzedAt || null,
        githubProfile: {
          username: me.githubLogin || "",
          avatarUrl: me.githubAvatar || "",
          name: me.githubName || null,
        },
      });

      setError(null);
      setLoading(false);
    } catch (err: any) {
      if (attempt < MAX_RETRIES) {
        setTimeout(() => fetchAll(attempt + 1), RETRY_DELAY_MS);
        return;
      }
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Bug 1 fix: only fire fetchAll once tokenReady flips to true
  useEffect(() => {
    if (!tokenReady) return;
    fetchAll(1); // Bug 3 fix: no .then(setLoading) here
  }, [tokenReady, fetchAll]);

  return { stack, loading, error };
}

export type { StackProfile };