"use client";

import React, { useState } from 'react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useUserStack } from '../../hooks/useUserStack';
import { Intent } from '@/lib/api';
import { RepoCard } from '../../components/RepoCard';
import { StackProfileComponent } from '../../components/StackProfile';
import { IntentSelector } from '../../components/IntentSelector';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [intent, setIntent] = useState<Intent | null>(null);
  const { stack: profile } = useUserStack();
  const { recommendations, loading: isLoading, error, refresh: fetchRecommendations, recordFeedback } = useRecommendations(intent);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* TopNavBar */}
      <header className="bg-zinc-950 docked full-width top-0 border-b-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-between px-6 py-3 w-full z-50 sticky">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-black uppercase text-white font-['Space_Grotesk'] font-bold tracking-tighter hover:text-[#238636] transition-colors">
            BRUTAL_GIT
          </Link>
          <div className="relative hidden md:flex items-center w-64 border-2 border-white bg-[#010409] focus-within:border-primary-container focus-within:border-[3px]">
            <span className="material-symbols-outlined absolute left-2 text-zinc-400 text-sm">search</span>
            <input className="w-full bg-transparent border-none text-white pl-8 pr-2 py-1 focus:ring-0 text-sm font-label-sm placeholder-zinc-500" placeholder="Search..." type="text"/>
            <div className="absolute right-2 px-1 border border-zinc-600 text-zinc-500 text-[10px] rounded flex items-center justify-center">/</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <a className="text-zinc-400 hover:bg-zinc-800 hover:text-white transition-none px-2 py-1 font-label-sm uppercase" href="#">Pull requests</a>
          <a className="text-zinc-400 hover:bg-zinc-800 hover:text-white transition-none px-2 py-1 font-label-sm uppercase" href="#">Issues</a>
          <a className="text-zinc-400 hover:bg-zinc-800 hover:text-white transition-none px-2 py-1 font-label-sm uppercase" href="#">Marketplace</a>
          <a className="text-[#238636] border-b-2 border-[#238636] hover:bg-zinc-800 hover:text-white transition-none px-2 py-1 font-label-sm uppercase" href="#">Explore</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white"><span className="material-symbols-outlined">notifications</span></button>
          <button className="text-zinc-400 hover:text-white border-2 border-zinc-400 hover:border-white w-6 h-6 flex items-center justify-center"><span className="material-symbols-outlined text-sm">add</span></button>
          <button className="text-zinc-400 hover:text-white"><span className="material-symbols-outlined">help</span></button>
          <div className="w-8 h-8 border-2 border-white brutal-shadow-level-1 overflow-hidden bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
            {'ME'}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-gutter py-12 grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
        
        {/* Sidebar (Left) */}
        <div className="md:col-span-3">
          {isLoading || profile === undefined ? (
            <div className="brutal-border bg-surface p-4 brutal-shadow-level-2 text-zinc-400">
              Loading profile...
            </div>
          ) : profile ? (
            <StackProfileComponent profile={profile} />
          ) : (
            <div className="brutal-border bg-surface p-4 brutal-shadow-level-2 text-zinc-400">
              No profile connected.
            </div>
          )}
        </div>

        {/* Main Content Area (Right) */}
        <div className="md:col-span-9 flex flex-col gap-6">
          <IntentSelector onSelectIntent={setIntent} />

          {/* Filters & Actions Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 pb-4 border-b-[3px] border-white mt-6">
            <h2 className="font-headline-lg text-[24px] text-white uppercase m-0">Recommended for You</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex border-2 border-white bg-zinc-900 brutal-shadow-level-1">
                <button className="px-3 py-2 font-label-sm text-white border-r-2 border-white bg-zinc-800 hover:bg-zinc-700 uppercase flex items-center gap-1">
                  Type <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
                </button>
                <button className="px-3 py-2 font-label-sm text-white hover:bg-zinc-700 uppercase flex items-center gap-1">
                  Language <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
                </button>
              </div>
            </div>
          </div>

          {/* Repository List */}
          {error && (
            <div className="border-2 border-[#ffb4ab] bg-[#93000a] text-[#ffdad6] p-4 brutal-shadow-level-2 uppercase font-bold text-sm">
              <span className="material-symbols-outlined mr-2 inline-block align-middle">error</span>
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col border-2 border-white bg-surface brutal-shadow-level-3 p-12 items-center justify-center gap-4 text-zinc-400">
              <span className="material-symbols-outlined text-[48px] animate-spin">sync</span>
              <span className="font-mono text-white text-sm uppercase">Calculating match weights...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col border-2 border-white bg-surface brutal-shadow-level-3 p-12 items-center justify-center gap-4 text-zinc-400">
              <span className="material-symbols-outlined text-[48px]">search_off</span>
              <span className="font-mono text-white text-sm uppercase">No recommendations found. Adjust filters.</span>
            </div>
          ) : (
            <div className="flex flex-col border-2 border-white bg-surface brutal-shadow-level-3">
              <AnimatePresence>
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.repo.fullName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <RepoCard
                      recommendation={rec}
                      onFeedback={(signal) => recordFeedback(rec.repo.fullName, signal, index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && recommendations.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="inline-flex border-2 border-white bg-surface brutal-shadow-level-2">
                <button className="px-4 py-2 border-r-2 border-white hover:bg-zinc-800 text-zinc-500 cursor-not-allowed font-label-sm uppercase">Previous</button>
                <button className="px-4 py-2 border-r-2 border-white bg-zinc-800 text-white font-bold font-label-sm">1</button>
                <button className="px-4 py-2 border-r-2 border-white hover:bg-zinc-800 text-zinc-300 font-label-sm">2</button>
                <button className="px-4 py-2 hover:bg-zinc-800 text-white font-label-sm uppercase">Next</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
