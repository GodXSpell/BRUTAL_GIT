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

"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
  };
}

export function useUserStack() {
  const [stack, setStack] = useState<StackProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const token = localStorage.getItem("stackmatch_token");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        // /api/v1/me/stack returns EVERYTHING — user info + stack profile
        // No need for a separate /api/v1/me call
        const stackRes = await fetch(`${API_URL}/api/v1/me/stack`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!stackRes.ok) {
          throw new Error(`API error: stack=${stackRes.status}`);
        }

        const data = await stackRes.json();
        console.log("stack response:", data);

        const sp = data.stackProfile;

        if (!sp) {
          throw new Error("stackProfile missing from response");
        }

        // Store userId for feedback calls later
        if (data.userId) {
          localStorage.setItem("stackmatch_user_id", data.userId);
        }

        setStack({
          primaryLanguages: sp.primaryLanguages || [],
          frameworks: sp.frameworks || [],
          domains: sp.domains || [],
          activityPattern: sp.activityPattern || null,
          intent: sp.intent || null,
          totalRepos: sp.totalRepos || 0,
          totalStarsGiven: sp.totalStarsGiven || 0,
          lastAnalyzedAt: sp.lastAnalyzedAt || null,
          // User info lives at the TOP level of the response, not inside stackProfile
          githubProfile: {
            username: data.githubLogin || "",
            avatarUrl: data.githubAvatar || "",
            name: data.githubName || null,
          },
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { stack, loading, error };
}