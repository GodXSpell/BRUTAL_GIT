// "use client";

// import { useState, useEffect } from "react";
// import { apiGet, StackProfile } from "@/lib/api";

// export function useUserStack() {
//   const [stack, setStack] = useState<StackProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchStack() {
//       try {
//         const token = localStorage.getItem("stackmatch_token");
//         if (!token) {
//           throw new Error("No token");
//         }
//         const data = await apiGet("/api/v1/me/stack", token);
//         setStack(data.stackProfile);
//       } catch (err: any) {
//         // Fallback to local github_user if API fails or token is missing
//         const cachedUser = localStorage.getItem("github_user");
//         if (cachedUser) {
//           try {
//             const userObj = JSON.parse(cachedUser);
            
//             // Attempt to fetch user repos to get actual languages and frameworks
//             let primaryLanguages: Array<{ name: string; weightPct: number }> = [];
//             let frameworks: Array<{ name: string; source: string; confidence: number }> = [];
//             let topRepos: Array<{ name: string; url: string; stars: number }> = [];
              
//             try {
//               const reposRes = await fetch(`https://api.github.com/users/${userObj.login}/repos?per_page=100`);
//               if (reposRes.ok) {
//                 const repos = await reposRes.json();
                
//                 const langCounts: Record<string, number> = {};
//                 let totalLangs = 0;
//                 const topicsSet = new Set<string>();
                
//                 for (const r of repos) {
//                   if (r.language) {
//                     langCounts[r.language] = (langCounts[r.language] || 0) + 1;
//                     totalLangs++;
//                   }
//                   if (r.topics && Array.isArray(r.topics)) {
//                     r.topics.forEach((t: string) => topicsSet.add(t));
//                   }
//                 }
                
//                 // Get top repos by stars
//                 topRepos = [...repos]
//                   .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
//                   .slice(0, 5)
//                   .map(r => ({
//                     name: r.name,
//                     url: r.html_url,
//                     stars: r.stargazers_count || 0
//                   }));
                
//                 if (totalLangs > 0) {
//                   const sortedLangs = Object.entries(langCounts)
//                     .map(([name, count]) => ({
//                       name,
//                       weightPct: count / totalLangs
//                     }))
//                     .sort((a, b) => b.weightPct - a.weightPct)
//                     .slice(0, 5);
//                   primaryLanguages = sortedLangs;
//                 }
                
//                 if (topicsSet.size > 0) {
//                   frameworks = Array.from(topicsSet).slice(0, 10).map(t => ({
//                     name: t,
//                     source: "github",
//                     confidence: 1.0
//                   }));
//                 }
//               }
//             } catch(e) {
//               console.error("Failed to fetch github repos for profile", e);
//             }

//             setStack({
//               primaryLanguages,
//               frameworks,
//               domains: ["Frontend", "Backend", "AI"],
//               activityPattern: "Night Owl",
//               intent: "BUILDER",
//               totalRepos: userObj.public_repos || 42,
//               totalStarsGiven: 128,
//               lastAnalyzedAt: new Date().toISOString(),
//               githubProfile: {
//                 username: userObj.login,
//                 avatarUrl: userObj.avatar_url,
//                 name: userObj.name,
//                 topRepos
//               }
//             });
//             setError(null);
//             return; // Successful fallback
//           } catch(e) {}
//         }
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStack();
//   }, []);

//   return { stack, loading, error };
// }


"use client";
import { useState, useEffect } from "react";
import { apiGet, StackProfile } from "@/lib/api";

export function useUserStack() {
  const [stack, setStack] = useState<StackProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStack() {
      try {
        const token = localStorage.getItem("stackmatch_token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const data = await apiGet("/api/v1/me/stack", token);
        setStack(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStack();
  }, []);

  return { stack, loading, error };
}