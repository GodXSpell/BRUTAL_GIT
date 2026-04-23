import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-[#238636] font-['Space_Grotesk'] text-xs uppercase tracking-widest docked full-width border-t-2 border-white mt-12 flex flex-col md:flex-row justify-between items-center px-8 py-10 w-full z-40">
      <div className="flex items-center gap-2 mb-6 md:mb-0">
        <span className="material-symbols-outlined text-white" data-icon="terminal">terminal</span>
        <span className="text-lg font-black text-white">© 2024 BRUTAL_GIT_INC</span>
      </div>
      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4">
        <Link className="text-zinc-500 hover:text-[#238636] transition-none border-b-2 border-transparent hover:border-[#238636]" href="#">Terms</Link>
        <Link className="text-zinc-500 hover:text-[#238636] transition-none border-b-2 border-transparent hover:border-[#238636]" href="#">Privacy</Link>
        <Link className="text-zinc-500 hover:text-[#238636] transition-none border-b-2 border-transparent hover:border-[#238636]" href="#">Security</Link>
        <Link className="text-zinc-500 hover:text-[#238636] transition-none border-b-2 border-transparent hover:border-[#238636]" href="#">Status</Link>
        <Link className="text-zinc-500 hover:text-[#238636] transition-none border-b-2 border-transparent hover:border-[#238636]" href="#">Docs</Link>
        <Link className="text-zinc-500 hover:text-[#238636] transition-none border-b-2 border-transparent hover:border-[#238636]" href="#">Contact</Link>
      </nav>
    </footer>
  );
}
