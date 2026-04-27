import React from 'react';
import { StackProfile } from "../hooks/useUserStack";

export function StackProfileComponent({ profile }: { profile: StackProfile }) {
  if (!profile || !profile.primaryLanguages || profile.primaryLanguages.length === 0) {
    return (
      <div className="brutal-border bg-surface p-4 brutal-shadow-level-2">
        <div className="text-error font-bold font-mono">ERROR: INSUFFICIENT_DATA</div>
      </div>
    );
  }

  return (
    <aside className="flex flex-col gap-8 w-full">
      <div className="brutal-border bg-surface p-4 brutal-shadow-level-2">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-white">
          <img
            src={profile.githubProfile?.avatarUrl}
            className="w-12 h-12 border-2 border-white grayscale"
          />
          <div>
            <div className="font-bold text-white truncate max-w-[170px]">
              {profile.githubProfile?.name || profile.githubProfile?.username}
            </div>
            <div className="text-zinc-400 text-xs font-mono">
              @{profile.githubProfile?.username}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-4">
          <div className="text-xs font-mono text-zinc-500 uppercase mb-2">
            Top Languages
          </div>
          {profile.primaryLanguages.slice(0, 5).map((lang) => (
            <div key={lang.name} className="mb-1.5">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-white font-mono truncate mr-2">
                  {lang.name}
                </span>
                <span className="text-zinc-400">
                  {lang.weightPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 w-full">
                <div
                  className="h-full bg-[#238636]"
                  style={{ width: `${lang.weightPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Frameworks */}
        <div className="mb-4">
          <div className="text-xs font-mono text-zinc-500 uppercase mb-2">
            Frameworks
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.frameworks.slice(0, 6).map((fw) => (
              <span
                key={fw.name}
                className="text-xs px-2 py-0.5 border border-zinc-600 text-zinc-300 font-mono bg-zinc-900 border-opacity-50"
              >
                {fw.name}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs border-t-2 border-zinc-800 pt-3 mt-3">
          <div>
            <div className="text-white font-bold">{profile.totalRepos}</div>
            <div className="text-zinc-500">repos</div>
          </div>
          <div>
            <div className="text-white font-bold">
              {profile.totalStarsGiven}
            </div>
            <div className="text-zinc-500">stars given</div>
          </div>
          <div>
            <div className="text-[#238636] font-bold uppercase text-[10px]">
              {profile.activityPattern || "BUILDER"}
            </div>
            <div className="text-zinc-500">pattern</div>
          </div>
        </div>
      </div>

      {/* Details Links */}
      <div className="brutal-border bg-surface brutal-shadow-level-2">
        <div className="bg-zinc-900 border-b-2 border-white px-4 py-2">
          <h3 className="font-headline-lg text-sm text-white uppercase m-0 tracking-widest">
            Details
          </h3>
        </div>
        <ul className="flex flex-col m-0 p-0 list-none">
          <li className="border-b-2 border-zinc-800">
            <div className="block px-4 py-3 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase flex justify-between items-center transition-none">
              <span>Last Sync</span>
              <span className="text-xs font-mono">
                {profile.lastAnalyzedAt
                  ? new Date(profile.lastAnalyzedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}
