import React from "react";
import Link from "next/link";

export default function RepositoriesPage() {
  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-gutter py-12 grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
      {/*  Sidebar (Left)  */}
      <aside className="md:col-span-3 flex flex-col gap-8">
        {/*  User Info Block  */}
        <div className="brutal-border bg-surface p-4 brutal-shadow-level-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 border-2 border-white bg-zinc-800">
              <img
                alt="Avatar"
                className="w-full h-full object-cover grayscale"
                data-alt="Close up portrait of a young man with a serious expression, industrial lighting, stark contrast"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkFuqiAG_nbObV3SJKJdtAoZX2wMTNBpvrIvGe0DnWcYReQiidi5sCgPa9geRVXLCVqy5uIud4fdVzp3gQ8ZYzOwZlqRlP4Y1rpfBFyQoNT_hy2CmrnONcwHzJ4fumQ_otxNQ4gmk-CZrtKrtLE1pSuBu9gOqZSAnWQq3l0QJXabkGsfR3H453ybATXemIJBvRbKiUJ2EGeucKCD8eg0Cg3_q0NA5_hS1szZLdg4Dc_XZvk6OWjPRktnLJFRzT2Oq2TX-OjpXUjIc"
              />
            </div>
            <div>
              <h2 className="font-headline-lg text-lg m-0 p-0 text-white leading-none">
                zero_day
              </h2>
              <p className="font-label-sm text-zinc-400 m-0 mt-1">
                systems engineer
              </p>
            </div>
          </div>
          <div className="h-[2px] w-full bg-white mb-4"></div>
          <div className="flex gap-4 text-sm font-label-sm text-zinc-300">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-zinc-500">
                group
              </span>{" "}
              <strong>1.2k</strong>{" "}
              <span className="text-zinc-500">followers</span>
            </div>
            <div className="flex items-center gap-1">
              <strong>42</strong>{" "}
              <span className="text-zinc-500">following</span>
            </div>
          </div>
        </div>
        {/*  Recent Repos  */}
        <div className="brutal-border bg-surface brutal-shadow-level-2 flex flex-col">
          <div className="bg-zinc-900 border-b-2 border-white px-4 py-2 flex justify-between items-center">
            <h3 className="font-headline-lg text-sm text-white uppercase m-0 tracking-widest">
              Recent
            </h3>
            <button className="bg-primary-container text-white px-2 py-1 text-xs font-bold border-2 border-white brutal-shadow-level-1 brutal-button-interactive uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">add</span>{" "}
              New
            </button>
          </div>
          <div className="flex flex-col">
            <a
              className="px-4 py-3 border-b-2 border-zinc-800 hover:bg-zinc-800 flex items-center gap-2 group transition-none"
              href="#"
            >
              <div className="w-3 h-3 rounded-none border border-zinc-600 bg-secondary group-hover:bg-primary-container"></div>
              <span className="font-label-sm text-zinc-200 group-hover:text-white truncate">
                brutal-ui-core
              </span>
            </a>
            <a
              className="px-4 py-3 border-b-2 border-zinc-800 hover:bg-zinc-800 flex items-center gap-2 group transition-none"
              href="#"
            >
              <div className="w-3 h-3 rounded-none border border-zinc-600 bg-tertiary group-hover:bg-primary-container"></div>
              <span className="font-label-sm text-zinc-200 group-hover:text-white truncate">
                go-network-scanner
              </span>
            </a>
            <a
              className="px-4 py-3 border-b-2 border-zinc-800 hover:bg-zinc-800 flex items-center gap-2 group transition-none"
              href="#"
            >
              <div className="w-3 h-3 rounded-none border border-zinc-600 bg-error group-hover:bg-primary-container"></div>
              <span className="font-label-sm text-zinc-200 group-hover:text-white truncate">
                rust-cli-tools
              </span>
            </a>
            <a
              className="px-4 py-3 hover:bg-zinc-800 flex items-center gap-2 group transition-none"
              href="#"
            >
              <div className="w-3 h-3 rounded-none border border-zinc-600 bg-primary group-hover:bg-primary-container"></div>
              <span className="font-label-sm text-zinc-200 group-hover:text-white truncate">
                legacy-c-parser
              </span>
            </a>
          </div>
        </div>
        {/*  Explore Links  */}
        <div className="brutal-border bg-surface brutal-shadow-level-2">
          <div className="bg-zinc-900 border-b-2 border-white px-4 py-2">
            <h3 className="font-headline-lg text-sm text-white uppercase m-0 tracking-widest">
              Explore
            </h3>
          </div>
          <ul className="flex flex-col m-0 p-0 list-none">
            <li className="border-b-2 border-zinc-800">
              <a
                className="block px-4 py-3 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase flex justify-between items-center group"
                href="#"
              >
                <span className="group-hover:translate-x-1">Trending</span>
                <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">
                  arrow_forward
                </span>
              </a>
            </li>
            <li className="border-b-2 border-zinc-800">
              <a
                className="block px-4 py-3 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase flex justify-between items-center group"
                href="#"
              >
                <span className="group-hover:translate-x-1">Collections</span>
                <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">
                  arrow_forward
                </span>
              </a>
            </li>
            <li>
              <a
                className="block px-4 py-3 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase flex justify-between items-center group"
                href="#"
              >
                <span className="group-hover:translate-x-1">Events</span>
                <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">
                  arrow_forward
                </span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
      {/*  Main Content Area (Right)  */}
      <div className="md:col-span-9 flex flex-col gap-6">
        {/*  Filters & Actions Header  */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 pb-4 border-b-[3px] border-white">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-80 border-2 border-white bg-[#010409] focus-within:border-primary-container focus-within:border-[3px]">
              <input
                className="w-full bg-transparent border-none text-white px-4 py-2 focus:ring-0 font-body-md placeholder-zinc-600"
                placeholder="Find a repository..."
                type="text"
              />
            </div>
            <div className="flex border-2 border-white bg-zinc-900 brutal-shadow-level-1">
              <button className="px-3 py-2 font-label-sm text-white border-r-2 border-white bg-zinc-800 hover:bg-zinc-700 uppercase flex items-center gap-1">
                Type{" "}
                <span className="material-symbols-outlined text-[10px]">
                  arrow_drop_down
                </span>
              </button>
              <button className="px-3 py-2 font-label-sm text-white hover:bg-zinc-700 uppercase flex items-center gap-1">
                Language{" "}
                <span className="material-symbols-outlined text-[10px]">
                  arrow_drop_down
                </span>
              </button>
            </div>
          </div>
        </div>
        {/*  Repository List  */}
        <div className="flex flex-col border-2 border-white bg-surface brutal-shadow-level-3">
          {/*  Repo Item 1  */}
          <article className="p-6 border-b-2 border-white hover:bg-zinc-900/50 transition-colors group relative">
            {/*  Hard Grid Vertical Line decoration  */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary-container opacity-0 group-hover:opacity-100"></div>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-headline-lg text-2xl text-[#7bdb80] m-0">
                    <a className="hover:underline" href="#">
                      system-crusher-v2
                    </a>
                  </h3>
                  <span className="border border-zinc-600 px-2 py-0.5 text-[10px] font-label-sm uppercase text-zinc-400 bg-zinc-900 rounded-full">
                    Public
                  </span>
                </div>
                <p className="font-body-md text-zinc-300 mb-4 max-w-3xl">
                  High-performance load testing framework built with memory-safe
                  primitives. Designed to find breaking points in distributed
                  architectures.
                </p>
                <div className="flex items-center gap-6 text-sm font-label-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#f1e05a] border border-zinc-800"></div>
                    <span>Rust</span>
                  </div>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-secondary">
                      star
                    </span>{" "}
                    2.4k
                  </a>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-primary">
                      fork_right
                    </span>{" "}
                    342
                  </a>
                  <span>Updated 2 hours ago</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button className="flex items-center gap-1 border-2 border-white bg-zinc-800 text-white px-3 py-1.5 font-label-sm uppercase brutal-shadow-level-1 brutal-button-interactive hover:bg-zinc-700">
                  <span className="material-symbols-outlined text-sm">
                    star
                  </span>{" "}
                  Star
                </button>
              </div>
            </div>
            {/*  Activity Graph Sparkline Mockup  */}
            <div className="mt-4 h-8 flex items-end gap-[2px] opacity-50 group-hover:opacity-100 transition-opacity">
              {/*  Bars  */}
              <div className="w-3 bg-primary-container h-[20%]"></div>
              <div className="w-3 bg-primary-container h-[40%]"></div>
              <div className="w-3 bg-primary-container h-[30%]"></div>
              <div className="w-3 bg-primary-container h-[70%]"></div>
              <div className="w-3 bg-primary-container h-[50%]"></div>
              <div className="w-3 bg-primary-container h-[90%]"></div>
              <div className="w-3 bg-[#7bdb80] h-[100%] border-t-2 border-white"></div>
              <div className="w-3 bg-primary-container h-[60%]"></div>
              <div className="w-3 bg-primary-container h-[40%]"></div>
              <div className="w-3 bg-primary-container h-[20%]"></div>
            </div>
          </article>
          {/*  Repo Item 2  */}
          <article className="p-6 border-b-2 border-white hover:bg-zinc-900/50 transition-colors group relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-tertiary-container opacity-0 group-hover:opacity-100"></div>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-headline-lg text-2xl text-[#7bdb80] m-0">
                    <a className="hover:underline" href="#">
                      neural-mesh-go
                    </a>
                  </h3>
                  <span className="border border-zinc-600 px-2 py-0.5 text-[10px] font-label-sm uppercase text-zinc-400 bg-zinc-900 rounded-full">
                    Public
                  </span>
                </div>
                <p className="font-body-md text-zinc-300 mb-4 max-w-3xl">
                  Decentralized node communication protocol for edge AI
                  deployment. Low latency, zero-trust architecture.
                </p>
                <div className="flex items-center gap-6 text-sm font-label-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#00ADD8] border border-zinc-800"></div>
                    <span>Go</span>
                  </div>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-secondary">
                      star
                    </span>{" "}
                    891
                  </a>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-primary">
                      fork_right
                    </span>{" "}
                    120
                  </a>
                  <span>Updated yesterday</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button className="flex items-center gap-1 border-2 border-white bg-zinc-800 text-white px-3 py-1.5 font-label-sm uppercase brutal-shadow-level-1 brutal-button-interactive hover:bg-zinc-700">
                  <span className="material-symbols-outlined text-sm">
                    star
                  </span>{" "}
                  Star
                </button>
              </div>
            </div>
          </article>
          {/*  Repo Item 3  */}
          <article className="p-6 border-b-2 border-white hover:bg-zinc-900/50 transition-colors group relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary opacity-0 group-hover:opacity-100"></div>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-headline-lg text-2xl text-[#7bdb80] m-0">
                    <a className="hover:underline" href="#">
                      brutal-css-framework
                    </a>
                  </h3>
                  <span className="border border-zinc-600 px-2 py-0.5 text-[10px] font-label-sm uppercase text-[#d8c93a] border-[#d8c93a] bg-zinc-900 rounded-full">
                    Private
                  </span>
                </div>
                <p className="font-body-md text-zinc-300 mb-4 max-w-3xl">
                  Internal structural CSS system enforcing hard grids and solid
                  colors. No gradients, no blurs, just borders.
                </p>
                <div className="flex items-center gap-6 text-sm font-label-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#563d7c] border border-zinc-800"></div>
                    <span>CSS</span>
                  </div>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-secondary">
                      star
                    </span>{" "}
                    12
                  </a>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-primary">
                      fork_right
                    </span>{" "}
                    3
                  </a>
                  <span>Updated 3 days ago</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex border-2 border-white bg-zinc-800 brutal-shadow-level-1">
                  <button className="px-3 py-1.5 font-label-sm text-zinc-400 border-r-2 border-white hover:text-white hover:bg-zinc-700 uppercase flex items-center gap-1 disabled">
                    <span className="material-symbols-outlined text-sm">
                      star
                    </span>{" "}
                    Starred
                  </button>
                  <button className="px-2 py-1.5 font-label-sm text-zinc-400 hover:text-white hover:bg-zinc-700 uppercase flex items-center">
                    <span className="material-symbols-outlined text-sm">
                      arrow_drop_down
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </article>
          {/*  Repo Item 4  */}
          <article className="p-6 hover:bg-zinc-900/50 transition-colors group relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-error opacity-0 group-hover:opacity-100"></div>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-headline-lg text-2xl text-[#7bdb80] m-0">
                    <a className="hover:underline" href="#">
                      legacy-db-migrator
                    </a>
                  </h3>
                  <span className="border border-zinc-600 px-2 py-0.5 text-[10px] font-label-sm uppercase text-zinc-400 bg-zinc-900 rounded-full">
                    Archived
                  </span>
                </div>
                <p className="font-body-md text-zinc-300 mb-4 max-w-3xl">
                  Scripts to move data out of old monolithic SQL servers into
                  distributed key-value stores.
                </p>
                <div className="flex items-center gap-6 text-sm font-label-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#3572A5] border border-zinc-800"></div>
                    <span>Python</span>
                  </div>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-secondary">
                      star
                    </span>{" "}
                    56
                  </a>
                  <a
                    className="flex items-center gap-1 hover:text-white group/stat"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-sm group-hover/stat:text-primary">
                      fork_right
                    </span>{" "}
                    14
                  </a>
                  <span>Updated last month</span>
                </div>
              </div>
            </div>
          </article>
        </div>
        {/*  Pagination  */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex border-2 border-white bg-surface brutal-shadow-level-2">
            <button className="px-4 py-2 border-r-2 border-white hover:bg-zinc-800 text-zinc-500 cursor-not-allowed font-label-sm uppercase">
              Previous
            </button>
            <button className="px-4 py-2 border-r-2 border-white bg-zinc-800 text-white font-bold font-label-sm">
              1
            </button>
            <button className="px-4 py-2 border-r-2 border-white hover:bg-zinc-800 text-zinc-300 font-label-sm">
              2
            </button>
            <button className="px-4 py-2 border-r-2 border-white hover:bg-zinc-800 text-zinc-300 font-label-sm">
              3
            </button>
            <button className="px-4 py-2 hover:bg-zinc-800 text-white font-label-sm uppercase">
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
