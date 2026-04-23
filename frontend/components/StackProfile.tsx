import React from 'react';
import { StackProfile } from '../lib/api';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: 'bg-[#f1e05a]',
  TypeScript: 'bg-[#3178c6]',
  Python: 'bg-[#3572A5]',
  Java: 'bg-[#b07219]',
  Go: 'bg-[#00ADD8]',
  Rust: 'bg-[#dea584]',
  'C++': 'bg-[#f34b7d]',
  CSS: 'bg-[#563d7c]',
};

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
      {/* User Info Block */}
      <div className="brutal-border bg-surface p-4 brutal-shadow-level-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 border-2 border-white bg-zinc-800 flex items-center justify-center font-bold text-lg text-white overflow-hidden">
            {profile.githubProfile?.avatarUrl ? (
              <img src={profile.githubProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              'ME'
            )}
          </div>
          <div>
            <h2 className="font-headline-lg text-lg m-0 p-0 text-white leading-none truncate max-w-[150px]">
              {profile.githubProfile?.name || profile.githubProfile?.username || "User"}
            </h2>
            <p className="font-label-sm text-zinc-400 m-0 mt-1 max-w-[150px] truncate">
              {profile.githubProfile?.username ? `@${profile.githubProfile.username}` : (profile.activityPattern || "systems engineer")}
            </p>
          </div>
        </div>
        <div className="h-[2px] w-full bg-white mb-4"></div>
        <div className="flex gap-4 text-sm font-label-sm text-zinc-300 uppercase">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-zinc-500">group</span> 
            <strong>{profile.totalRepos}</strong> <span className="text-zinc-500">repos</span>
          </div>
        </div>
      </div>

      {/* Languages & Frameworks Block */}
      <div className="brutal-border bg-surface brutal-shadow-level-2 flex flex-col">
        <div className="bg-zinc-900 border-b-2 border-white px-4 py-2 flex justify-between items-center">
          <h3 className="font-headline-lg text-sm text-white uppercase m-0 tracking-widest">Stack</h3>
        </div>
        <div className="flex flex-col">
          {profile.primaryLanguages.slice(0, 5).map((lang) => (
            <div key={lang.name} className="px-4 py-3 border-b-2 border-zinc-800 hover:bg-zinc-800 flex justify-between items-center group transition-none">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-none border border-zinc-600 ${LANGUAGE_COLORS[lang.name] || 'bg-primary'} group-hover:bg-primary-container`}></div>
                <span className="font-label-sm text-zinc-200 group-hover:text-white truncate">{lang.name}</span>
              </div>
              <span className="font-mono text-xs text-zinc-500">{Math.round(lang.weightPct * 100)}%</span>
            </div>
          ))}
        </div>
        {profile.frameworks && profile.frameworks.length > 0 && (
          <div className="p-4 flex flex-wrap gap-2">
            {profile.frameworks.map((fw) => (
              <span key={fw.name} className="border border-zinc-600 px-2 py-1 text-[10px] font-label-sm uppercase text-zinc-400 bg-zinc-900">
                {fw.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Top Repositories */}
      {profile.githubProfile?.topRepos && profile.githubProfile.topRepos.length > 0 && (
        <div className="brutal-border bg-surface brutal-shadow-level-2">
          <div className="bg-zinc-900 border-b-2 border-white px-4 py-2">
            <h3 className="font-headline-lg text-sm text-white uppercase m-0 tracking-widest">Top Repos</h3>
          </div>
          <ul className="flex flex-col m-0 p-0 list-none">
            {profile.githubProfile.topRepos.map((repo) => (
              <li key={repo.url} className="border-b-2 border-zinc-800 last:border-b-0">
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-800 flex justify-between items-center group transition-none">
                  <span className="group-hover:translate-x-1 truncate max-w-[200px]">{repo.name}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-[12px]">star</span>
                    <span>{repo.stars}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Details Links */}
      <div className="brutal-border bg-surface brutal-shadow-level-2">
        <div className="bg-zinc-900 border-b-2 border-white px-4 py-2">
          <h3 className="font-headline-lg text-sm text-white uppercase m-0 tracking-widest">Details</h3>
        </div>
        <ul className="flex flex-col m-0 p-0 list-none">
          <li className="border-b-2 border-zinc-800">
            <div className="block px-4 py-3 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase flex justify-between items-center group cursor-pointer">
              <span className="group-hover:translate-x-1">Last Sync</span>
              <span className="text-xs">{profile.lastAnalyzedAt ? new Date(profile.lastAnalyzedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}
