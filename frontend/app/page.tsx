"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleActionClick = () => {
    const token = localStorage.getItem("stackmatch_token");
    if (token) {
      router.push('/repositories');
    } else {
      router.push('/oauth');
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center w-full max-w-[1440px] mx-auto px-4 md:px-lg py-12 gap-xl">
{/*  Hero Section  */}
<section className="w-full flex flex-col items-start border-4 border-white p-lg md:p-xl relative bg-zinc-950 shadow-[8px_8px_0px_0px_#238636]">
{/*  Decorative Grid Lines inside Hero  */}
<div className="absolute inset-0 pointer-events-none grid grid-cols-12 gap-0 opacity-20">
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="border-r border-white col-span-1 h-full"></div>
<div className="col-span-1 h-full"></div>
</div>
<div className="relative z-10 max-w-4xl">
<div className="inline-flex items-center gap-2 border-2 border-[#238636] px-3 py-1 mb-6 bg-black text-[#238636] font-label-sm text-label-sm uppercase tracking-widest shadow-[2px_2px_0px_0px_#238636]">
<span className="material-symbols-outlined text-sm" data-icon="deployed_code">deployed_code</span>
                    v2.0 is live
                </div>
<h1 className="font-headline-xl text-headline-xl text-white uppercase break-words mb-8 drop-shadow-[4px_4px_0px_rgba(35,134,54,1)]">
                    CODE.<br/>
                    COMMIT.<br/>
                    REPEAT.
                </h1>
<p className="font-body-md text-body-md text-zinc-300 max-w-2xl mb-10 border-l-4 border-white pl-4">
                    The unyielding platform for developers who build hard, ship fast, and don't compromise. No soft edges. No ambient blurs. Just pure, functional velocity.
                </p>
<div className="flex flex-col sm:flex-row gap-4">
<button onClick={handleActionClick} className="bg-[#F0E050] text-black font-headline-lg text-[20px] font-bold uppercase px-8 py-4 border-2 border-black shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[2px_2px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2">
                        Initialize Repository
                        <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
<button className="bg-black text-white font-headline-lg text-[20px] font-bold uppercase px-8 py-4 border-2 border-white shadow-[4px_4px_0px_0px_#238636] hover:shadow-[2px_2px_0px_0px_#238636] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2">
                        Read Docs
                    </button>
</div>
</div>
{/*  Brutalist Status block  */}
<div className="absolute bottom-0 right-0 border-t-4 border-l-4 border-white bg-black p-4 hidden lg:flex flex-col items-end min-w-[200px]">
<div className="text-zinc-500 font-label-sm text-label-sm uppercase mb-1">System Status</div>
<div className="text-[#238636] font-headline-lg text-[24px] flex items-center gap-2">
<span className="w-3 h-3 bg-[#238636] animate-pulse rounded-none"></span>
                    OPERATIONAL
                </div>
</div>
</section>
{/*  Start Your Open Source Journey  */}
<section className="w-full mt-8 border-4 border-white bg-zinc-950 p-8 shadow-[8px_8px_0px_0px_#ffffff]">
<div className="flex flex-col md:flex-row gap-8 items-center">
<div className="flex-1">
<h2 className="font-headline-xl text-[48px] text-[#238636] uppercase mb-4 leading-tight">Start Your<br/><span className="text-white">Open Source Journey</span></h2>
<p className="font-body-md text-zinc-300 mb-6 border-l-2 border-[#238636] pl-4">Frictionless onboarding with ephemeral environments. No setup required. Spin up a dev container, fix a bug, commit, and destroy.</p>
<button className="bg-white text-black font-headline-lg text-[16px] font-bold uppercase px-6 py-3 border-2 border-white hover:bg-black hover:text-white transition-none shadow-[4px_4px_0px_0px_#238636] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2">
                    Spin Up Env <span className="material-symbols-outlined text-[20px]" data-icon="rocket_launch">rocket_launch</span>
</button>
</div>
<div className="flex-1 bg-black border-4 border-zinc-800 p-6 w-full font-mono text-sm text-[#7bdb80] overflow-x-auto">
<pre><code>$ brutal-cli env create --repo org/project
&gt; Provisioning ephemeral container...
&gt; Injecting secrets...
&gt; Mounting workspace...
[SUCCESS] Environment ready.
$ code .
</code></pre>
</div>
</div>
</section>
{/*  Resolve Issues & Commits  */}
<section className="w-full mt-8">
<div className="border-b-4 border-white pb-4 mb-6">
<h2 className="font-headline-lg text-headline-lg text-white uppercase flex items-center gap-3">
<span className="material-symbols-outlined text-[32px] text-white" data-icon="bug_report">bug_report</span>
                Resolve Issues &amp; Commits
            </h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
{/*  Issues Column  */}
<div className="border-4 border-white bg-black flex flex-col">
<div className="bg-white text-black p-4 font-headline-lg text-[20px] uppercase border-b-4 border-white flex justify-between items-center">
<span>Good First Issues</span>
<span className="material-symbols-outlined" data-icon="filter_alt">filter_alt</span>
</div>
<div className="flex flex-col p-4 gap-4">
<div className="border-2 border-zinc-700 p-4 hover:border-[#238636] transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<span className="text-[#238636] font-bold text-lg">#1024</span>
<span className="bg-[#238636]/20 text-[#238636] px-2 py-1 text-xs uppercase border border-[#238636]">Help Wanted</span>
</div>
<h4 className="text-white font-headline-lg text-[18px] group-hover:underline">Fix race condition in rendering engine</h4>
<p className="text-zinc-500 text-sm mt-2">project-x / core</p>
</div>
<div className="border-2 border-zinc-700 p-4 hover:border-[#238636] transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<span className="text-[#238636] font-bold text-lg">#891</span>
<span className="bg-[#238636]/20 text-[#238636] px-2 py-1 text-xs uppercase border border-[#238636]">Good First Issue</span>
</div>
<h4 className="text-white font-headline-lg text-[18px] group-hover:underline">Update documentation for v2 API</h4>
<p className="text-zinc-500 text-sm mt-2">docs-repo / main</p>
</div>
</div>
<button className="m-4 mt-auto border-2 border-white text-white p-3 hover:bg-white hover:text-black uppercase font-bold text-sm tracking-widest transition-none">View All Issues</button>
</div>
{/*  Commits Column  */}
<div className="border-4 border-white bg-black flex flex-col">
<div className="bg-zinc-900 text-white p-4 font-headline-lg text-[20px] uppercase border-b-4 border-white flex justify-between items-center">
<span>Recent Commits</span>
<span className="material-symbols-outlined" data-icon="history">history</span>
</div>
<div className="flex flex-col divide-y-2 divide-zinc-800">
<div className="p-4 flex gap-4 hover:bg-zinc-900 transition-colors">
<div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center font-bold text-zinc-400">0xA1</div>
<div>
<p className="text-white font-mono text-sm mb-1">Merge pull request #42 from feature/brutal-ui</p>
<div className="flex gap-2 text-xs text-zinc-500 font-mono">
<span className="text-[#238636]">+124</span>
<span className="text-red-500">-12</span>
<span>2 mins ago</span>
</div>
</div>
</div>
<div className="p-4 flex gap-4 hover:bg-zinc-900 transition-colors">
<div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center font-bold text-zinc-400">0x9F</div>
<div>
<p className="text-white font-mono text-sm mb-1">refactor: remove soft gradients globally</p>
<div className="flex gap-2 text-xs text-zinc-500 font-mono">
<span className="text-[#238636]">+5</span>
<span className="text-red-500">-89</span>
<span>1 hour ago</span>
</div>
</div>
</div>
<div className="p-4 flex gap-4 hover:bg-zinc-900 transition-colors">
<div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center font-bold text-zinc-400">0x8E</div>
<div>
<p className="text-white font-mono text-sm mb-1">fix: align grid to 4px baseline</p>
<div className="flex gap-2 text-xs text-zinc-500 font-mono">
<span className="text-[#238636]">+45</span>
<span className="text-red-500">-45</span>
<span>3 hours ago</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Agentic Flow Section  */}
<section className="w-full mt-8 border-4 border-[#238636] bg-black p-8 relative overflow-hidden">
<div className="absolute right-0 top-0 opacity-10 pointer-events-none">
<span className="material-symbols-outlined text-[400px] -translate-y-1/4 translate-x-1/4 text-[#238636]" data-icon="smart_toy">smart_toy</span>
</div>
<div className="relative z-10 max-w-3xl">
<div className="inline-flex items-center gap-2 bg-[#238636] text-black px-3 py-1 mb-6 font-bold text-sm uppercase tracking-widest border-2 border-white">
<span className="material-symbols-outlined text-sm" data-icon="auto_awesome">auto_awesome</span>
                AI-Orchestrated
            </div>
<h2 className="font-headline-xl text-[48px] text-white uppercase mb-4 leading-tight">Agentic Flow</h2>
<p className="font-body-md text-zinc-300 mb-8 border-l-4 border-[#238636] pl-4 text-lg">Self-Healing Pipelines keep you in the flow state. Our agents automatically analyze failures, suggest fixes, and test patches before you even see the red X.</p>
<div className="flex items-center gap-4 border-2 border-zinc-700 p-4 bg-zinc-950 w-max">
<span className="material-symbols-outlined text-[#238636] animate-spin" data-icon="sync">sync</span>
<span className="font-mono text-white text-sm">Pipeline #8892 Failed. Agent analyzing stack trace...</span>
</div>
</div>
</section>
{/*  Trending Repositories Grid  */}
<section className="w-full mt-8">
<div className="flex items-center justify-between border-b-4 border-white pb-4 mb-8">
<h2 className="font-headline-lg text-headline-lg text-white uppercase flex items-center gap-3">
<span className="material-symbols-outlined text-[32px] text-[#F0E050]" data-icon="trending_up">trending_up</span>
                    Trending Repositories
                </h2>
<a className="text-[#238636] font-label-sm text-label-sm uppercase hover:underline flex items-center gap-1" href="#">
                    View all <span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span>
</a>
</div>
{/*  Bento-style Brutalist Grid  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
{/*  Main Featured Repo (Span 8)  */}
<article className="md:col-span-8 border-4 border-white bg-zinc-950 p-6 flex flex-col shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[2px_2px_0px_0px_#ffffff] hover:translate-x-[4px] hover:translate-y-[4px] transition-all relative overflow-hidden group">
{/*  Background texture graphic  */}
<div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
<span className="material-symbols-outlined text-[240px] translate-x-1/4 -translate-y-1/4" data-icon="hub">hub</span>
</div>
<div className="flex items-start justify-between mb-4 relative z-10">
<div className="flex items-center gap-3">
<img alt="Organization Avatar" className="w-12 h-12 border-2 border-white grayscale" data-alt="abstract black and white geometric pattern, high contrast, sharp lines, industrial feel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU2Nv-RNsWe5NV-9KBiS6y_9Mlj5jmuilM8Xj00kKtJydxy1jkSFuwMwygTju9xTDV8ONewboNyd_KiV-aB_8Uu9h0PHqjGdeN0V61BJZteUotaBpUZwW2uffIMoKlMo0S_Ek8Hxya_3uYG0gjFItTy1SBfaPTcviMfN_xwb2JK04lMgD0FnSG2U2Yme5NUOkFvzCj4l5WS3wYtTCextW_J7gOMh7DIlZLCqbiQARxthYV3Oc9uPUXAatAEayllLHBTlyXzBPzDCg"/>
<div>
<h3 className="font-headline-lg text-[24px] text-white hover:text-[#238636] cursor-pointer">brutal-system / core-engine</h3>
<div className="text-zinc-400 font-label-sm text-label-sm uppercase">Updated 2 hours ago</div>
</div>
</div>
<button className="border-2 border-white bg-black text-white px-3 py-1 font-label-sm text-label-sm uppercase hover:bg-white hover:text-black transition-colors shadow-[2px_2px_0px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> Star
                        </button>
</div>
<p className="font-body-md text-body-md text-zinc-300 mb-6 flex-grow relative z-10 max-w-2xl border-l-2 border-[#238636] pl-3">
                        The blazingly fast, unopinionated execution engine for brutalist web applications. Written in Rust. Designed for zero-compromise performance.
                    </p>
<div className="flex items-center gap-4 border-t-2 border-zinc-800 pt-4 relative z-10 flex-wrap">
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm">
<span className="w-3 h-3 bg-[#DEA584] rounded-none border border-black inline-block"></span> Rust
                        </div>
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm hover:text-white cursor-pointer">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> 12.4k
                        </div>
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm hover:text-white cursor-pointer">
<span className="material-symbols-outlined text-[16px]" data-icon="fork_right">fork_right</span> 1.2k
                        </div>
<div className="flex items-center gap-1 text-[#238636] font-label-sm text-label-sm border border-[#238636] px-2 bg-[#238636]/10">
<span className="material-symbols-outlined text-[16px]" data-icon="check_circle">check_circle</span> Passing
                        </div>
</div>
</article>
{/*  Secondary Repo 1 (Span 4)  */}
<article className="md:col-span-4 border-4 border-white bg-zinc-950 p-6 flex flex-col shadow-[6px_6px_0px_0px_#238636] hover:shadow-[2px_2px_0px_0px_#238636] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
<div className="flex items-start justify-between mb-4">
<div>
<h3 className="font-headline-lg text-[20px] text-[#238636] hover:underline cursor-pointer break-words">ui-components / raw-css</h3>
</div>
</div>
<p className="font-body-md text-body-md text-zinc-400 mb-6 flex-grow">
                        A utility-first CSS framework that completely removes border-radius, soft shadows, and gradients.
                    </p>
<div className="flex items-center gap-4 border-t-2 border-zinc-800 pt-4 flex-wrap">
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm">
<span className="w-3 h-3 bg-[#563D7C] rounded-none border border-black inline-block"></span> CSS
                        </div>
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> 8.9k
                        </div>
</div>
</article>
{/*  Secondary Repo 2 (Span 6)  */}
<article className="md:col-span-6 border-4 border-white bg-[#010409] p-6 flex flex-col shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[2px_2px_0px_0px_#ffffff] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
<div className="flex items-start justify-between mb-4">
<div>
<h3 className="font-headline-lg text-[20px] text-white hover:text-[#F0E050] cursor-pointer">data-pipeline / terminal-viz</h3>
</div>
<div className="bg-[#F0E050] text-black font-label-sm text-[10px] uppercase px-2 py-1 font-bold border-2 border-black">New</div>
</div>
<p className="font-body-md text-body-md text-zinc-400 mb-6 flex-grow">
                        Command-line data visualization tool. Renders charts strictly using ASCII characters in your terminal.
                    </p>
<div className="flex items-center justify-between border-t-2 border-zinc-800 pt-4">
<div className="flex items-center gap-4">
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm">
<span className="w-3 h-3 bg-[#3572A5] rounded-none border border-black inline-block"></span> Python
                            </div>
<div className="flex items-center gap-1 text-zinc-300 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> 3.2k
                            </div>
</div>
{/*  Mini activity graph simulation  */}
<div className="flex gap-1 h-6 items-end">
<div className="w-2 bg-[#238636] h-2"></div>
<div className="w-2 bg-[#238636] h-4"></div>
<div className="w-2 bg-[#238636] h-3"></div>
<div className="w-2 bg-[#238636] h-6"></div>
<div className="w-2 bg-[#39d353] h-5"></div>
<div className="w-2 bg-[#39d353] h-full"></div>
</div>
</div>
</article>
{/*  Secondary Repo 3 (Span 6)  */}
<article className="md:col-span-6 border-4 border-white bg-zinc-950 p-6 flex flex-col shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[2px_2px_0px_0px_#ffffff] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-dashed">
<div className="flex items-center justify-center h-full min-h-[150px] flex-col gap-4">
<span className="material-symbols-outlined text-[48px] text-zinc-500" data-icon="travel_explore">travel_explore</span>
<h3 className="font-headline-lg text-[20px] text-zinc-400 text-center">Discover more trending repositories across the network.</h3>
<button className="mt-2 border-2 border-zinc-500 text-zinc-300 px-4 py-2 font-label-sm text-label-sm uppercase hover:border-white hover:text-white transition-colors bg-transparent">
                            Explore Network
                        </button>
</div>
</article>
</div>
</section>
{/*  Most Popular Section (List Layout)  */}
<section className="w-full mt-8 border-4 border-white bg-black">
<div className="border-b-4 border-white p-4 bg-zinc-900 flex justify-between items-center">
<h2 className="font-headline-lg text-[24px] text-white uppercase m-0 flex items-center gap-2">
<span className="material-symbols-outlined text-[#238636]" data-icon="local_fire_department">local_fire_department</span>
                    Most Popular Overall
                </h2>
<div className="hidden sm:flex border-2 border-white bg-black divide-x-2 divide-white">
<button className="px-4 py-1 text-[#238636] font-label-sm text-label-sm uppercase bg-zinc-900">All</button>
<button className="px-4 py-1 text-zinc-400 hover:text-white font-label-sm text-label-sm uppercase">C++</button>
<button className="px-4 py-1 text-zinc-400 hover:text-white font-label-sm text-label-sm uppercase">Go</button>
<button className="px-4 py-1 text-zinc-400 hover:text-white font-label-sm text-label-sm uppercase">JS/TS</button>
</div>
</div>
<div className="flex flex-col">
{/*  List Item 1  */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b-2 border-zinc-800 hover:bg-zinc-900 transition-colors gap-4">
<div className="flex-grow">
<div className="flex items-center gap-3 mb-2">
<h3 className="font-headline-lg text-[20px] text-white cursor-pointer hover:underline">facebook / react-brutal</h3>
<span className="border border-zinc-600 px-2 py-0.5 text-zinc-400 font-label-sm text-[10px] uppercase rounded-none">Public</span>
</div>
<p className="font-body-md text-body-md text-zinc-400 max-w-3xl">A declarative, efficient, and flexible JavaScript library for building unstyled user interfaces.</p>
</div>
<div className="flex items-center gap-6 min-w-max text-zinc-300 font-label-sm text-label-sm">
<div className="flex items-center gap-1">
<span className="w-3 h-3 bg-[#f1e05a] rounded-none border border-black inline-block"></span> JavaScript
                        </div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> 210k
                        </div>
</div>
</div>
{/*  List Item 2  */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b-2 border-zinc-800 hover:bg-zinc-900 transition-colors gap-4">
<div className="flex-grow">
<div className="flex items-center gap-3 mb-2">
<h3 className="font-headline-lg text-[20px] text-white cursor-pointer hover:underline">torvalds / linux-hardened</h3>
<span className="border border-zinc-600 px-2 py-0.5 text-zinc-400 font-label-sm text-[10px] uppercase rounded-none">Public</span>
</div>
<p className="font-body-md text-body-md text-zinc-400 max-w-3xl">Linux kernel source tree with brutalist security configurations applied by default.</p>
</div>
<div className="flex items-center gap-6 min-w-max text-zinc-300 font-label-sm text-label-sm">
<div className="flex items-center gap-1">
<span className="w-3 h-3 bg-[#555555] rounded-none border border-black inline-block"></span> C
                        </div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> 155k
                        </div>
</div>
</div>
{/*  List Item 3  */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 hover:bg-zinc-900 transition-colors gap-4">
<div className="flex-grow">
<div className="flex items-center gap-3 mb-2">
<h3 className="font-headline-lg text-[20px] text-white cursor-pointer hover:underline">golang / go-strict</h3>
<span className="border border-zinc-600 px-2 py-0.5 text-zinc-400 font-label-sm text-[10px] uppercase rounded-none">Public</span>
</div>
<p className="font-body-md text-body-md text-zinc-400 max-w-3xl">The Go programming language. No garbage collection allowed variant.</p>
</div>
<div className="flex items-center gap-6 min-w-max text-zinc-300 font-label-sm text-label-sm">
<div className="flex items-center gap-1">
<span className="w-3 h-3 bg-[#00ADD8] rounded-none border border-black inline-block"></span> Go
                        </div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="star">star</span> 112k
                        </div>
</div>
</div>
</div>
</section>
</main>
  );
}
