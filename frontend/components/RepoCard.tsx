import React from 'react';
import { RecommendationItem } from '../lib/api';

interface RepoCardProps {
  recommendation: RecommendationItem;
  onFeedback: (signal: "LIKE" | "DISLIKE" | "SKIP") => void;
}

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

export function RepoCard({ recommendation, onFeedback }: RepoCardProps) {
  const { repo, explanations } = recommendation;
  const matchReason = explanations?.[0]?.reason || "Recommended based on your stack profile.";
  
  // Extract primary language to get color
  const primaryLang = repo.primaryLanguage || 'Unknown';
  const langColor = LANGUAGE_COLORS[primaryLang] || 'bg-primary-container';

  return (
    <article className="p-6 border-b-2 border-white hover:bg-zinc-900/50 transition-colors group relative bg-surface">
      {/* Hard Grid Vertical Line decoration */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${langColor} opacity-0 group-hover:opacity-100`}></div>
      
      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-headline-lg text-2xl text-[#7bdb80] m-0">
              <a className="hover:underline" href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                {repo.fullName}
              </a>
            </h3>
            <span className="border border-zinc-600 px-2 py-0.5 text-[10px] font-label-sm uppercase text-zinc-400 bg-zinc-900 rounded-full">
              {'Public'}
            </span>
          </div>
          
          <p className="font-body-md text-zinc-300 mb-4 max-w-3xl">
            {repo.description || "No description available."}
          </p>
          
          <div className="flex items-center gap-6 text-sm font-label-sm text-zinc-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${langColor} border border-zinc-800`}></div>
              <span>{primaryLang}</span>
            </div>
            <a className="flex items-center gap-1 hover:text-white group/stat" href={`${repo.htmlUrl}/stargazers`} target="_blank">
              <span className="material-symbols-outlined text-sm group-hover/stat:text-secondary">star</span> {repo.stars}
            </a>
            <a className="flex items-center gap-1 hover:text-white group/stat" href={`${repo.htmlUrl}/network/members`} target="_blank">
              <span className="material-symbols-outlined text-sm group-hover/stat:text-primary">fork_right</span> {repo.forks}
            </a>
            <span>{matchReason}</span>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex sm:flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
          <button 
            onClick={() => onFeedback("LIKE")}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-white bg-[#238636] text-white px-4 py-2 font-label-sm uppercase brutal-shadow-level-1 brutal-button-interactive hover:bg-white hover:text-black transition-none"
          >
            <span className="material-symbols-outlined text-sm">thumb_up</span> Like
          </button>
          <div className="flex flex-1 gap-2">
            <button 
              onClick={() => onFeedback("SKIP")}
              className="flex-1 flex items-center justify-center border-2 border-white bg-zinc-800 text-zinc-300 px-3 py-2 hover:text-white hover:bg-zinc-700 brutal-shadow-level-1 brutal-button-interactive transition-none"
              title="Skip"
            >
              <span className="material-symbols-outlined text-sm">skip_next</span>
            </button>
            <button 
              onClick={() => onFeedback("DISLIKE")}
              className="flex-1 flex items-center justify-center border-2 border-white bg-zinc-800 text-zinc-300 px-3 py-2 hover:text-[#ffb4ab] hover:border-[#ffb4ab] brutal-shadow-level-1 brutal-button-interactive transition-none"
              title="Dislike"
            >
              <span className="material-symbols-outlined text-sm">thumb_down</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
