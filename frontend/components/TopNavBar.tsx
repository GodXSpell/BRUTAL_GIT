"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function TopNavBar() {
  const router = useRouter();

  const handleCommitClick = () => {
    const token = localStorage.getItem("stackmatch_token");
    if (token) {
      router.push('/repositories');
    } else {
      router.push('/oauth');
    }
  };

  return (
    <header className="bg-zinc-950 text-[#238636] font-['Space_Grotesk'] font-bold tracking-tighter docked full-width top-0 border-b-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-between px-6 py-3 w-full z-50 sticky">
      <div className="flex items-center gap-6 w-full max-w-7xl mx-auto">
        <Link className="text-2xl font-black uppercase text-white flex items-center gap-2 hover:bg-zinc-800 hover:text-white transition-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none p-2 border-2 border-transparent hover:border-white" href="/">
          <span className="material-symbols-outlined" data-icon="terminal">terminal</span>
          BRUTAL_GIT
        </Link>
        <div className="hidden md:flex items-center gap-4 border-l-2 border-zinc-700 pl-6 h-full flex-grow">
          <div className="relative flex items-center border-2 border-white bg-black w-full max-w-md">
            <span className="material-symbols-outlined absolute left-2 text-zinc-400" data-icon="search">search</span>
            <input className="bg-transparent text-white pl-8 pr-4 py-1 focus:outline-none focus:border-[#238636] font-body-md text-body-md placeholder-zinc-500 w-full border-none ring-0 focus:ring-0" placeholder="Search..." type="text"/>
            <div className="border-l-2 border-white px-2 text-zinc-400 font-label-sm text-label-sm flex items-center bg-zinc-900">
              <span className="material-symbols-outlined text-[16px]" data-icon="keyboard_command_key">keyboard_command_key</span>K
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <button onClick={handleCommitClick} className="bg-[#238636] text-white font-headline-lg text-[16px] font-bold uppercase px-6 py-2 border-2 border-[#238636] hover:bg-white hover:text-black transition-none shadow-[2px_2px_0px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            COMMIT
          </button>
        </div>
      </div>
    </header>
  );
}
