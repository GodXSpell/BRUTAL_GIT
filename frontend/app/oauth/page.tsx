"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OAuthPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleAuthorize = async () => {
    if (!username) return;
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("github_user", JSON.stringify(data));
        router.push("/dashboard");
      } else {
        alert("User not found!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <main className="flex-grow flex items-center justify-center p-md">
      <div className="w-full max-w-2xl bg-surface border-4 border-white brutal-shadow p-lg flex flex-col gap-lg">
        {/*  Header Section  */}
        <div className="flex flex-col items-center text-center gap-md border-b-2 border-white pb-md">
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 bg-[#010409] border-2 border-white flex items-center justify-center brutal-shadow-sm">
              <span className="material-symbols-outlined text-[32px] text-white">
                integration_instructions
              </span>
            </div>
            <span className="material-symbols-outlined text-white text-[24px]">
              sync_alt
            </span>
            <div className="w-16 h-16 bg-[#010409] border-2 border-white flex items-center justify-center brutal-shadow-sm overflow-hidden">
              <img
                alt="BRUTAL_GIT Logo"
                className="w-full h-full object-cover"
                data-alt="BRUTAL_GIT simple logo mark"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtfNPgiIQr3i2iEoCBAvskxlVvBcOeEpQVEUKJsuhkpj_WUGIb3zexxvL_9Wkf6HhFyx52L0NBBZzELUOm-fpaGPgTK00ScLSZov7ILHuLa1NOxkAkc-d9udzRwyw4PmcqG8er19oQIClfyQ6y2UkOWX3QOpZCzNJzH82XzNTQivUICjoAg9y8axRYUMbLkpIS0f2U-EikRsJ1UKjdR_KtTY4tz16o54NZ-weERu2vTF2Qz_XxIqE1K9rCxt01Pnh0qRCb2bfAxik"
              />
            </div>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-white mb-sm uppercase">
              Authorize BRUTAL_GIT
            </h1>
            <p className="font-body-md text-body-md text-zinc-400">
              BRUTAL_GIT wants to access your GitHub account.
            </p>
          </div>
        </div>
        {/*  Permissions List  */}
        <div className="flex flex-col gap-sm">
          <h2 className="font-headline-lg text-[24px] text-white uppercase border-l-4 border-[#238636] pl-sm">
            Requested Permissions
          </h2>
          <div className="flex flex-col border-2 border-zinc-700 bg-[#010409]">
            <div className="flex items-start gap-sm p-sm border-b-2 border-zinc-700 last:border-b-0">
              <span className="material-symbols-outlined text-zinc-400 mt-1">
                account_circle
              </span>
              <div>
                <div className="font-label-sm text-label-sm text-white uppercase mb-1">
                  Personal user data
                </div>
                <div className="font-body-md text-body-md text-zinc-400 text-sm">
                  Read access to your profile information, email addresses, and
                  followers.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-sm p-sm border-b-2 border-zinc-700 last:border-b-0">
              <span className="material-symbols-outlined text-zinc-400 mt-1">
                folder_open
              </span>
              <div>
                <div className="font-label-sm text-label-sm text-white uppercase mb-1">
                  Repositories
                </div>
                <div className="font-body-md text-body-md text-zinc-400 text-sm">
                  Read and write access to code, commit statuses, repository
                  invitations, collaborators, deployment statuses, and webhooks.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-sm p-sm border-b-2 border-zinc-700 last:border-b-0">
              <span className="material-symbols-outlined text-zinc-400 mt-1">
                api
              </span>
              <div>
                <div className="font-label-sm text-label-sm text-white uppercase mb-1">
                  Workflows
                </div>
                <div className="font-body-md text-body-md text-zinc-400 text-sm">
                  Update GitHub Action workflows.
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*  Organization Access (Optional)  */}
        <div className="flex flex-col gap-sm">
          <h2 className="font-headline-lg text-[20px] text-white uppercase border-l-4 border-zinc-500 pl-sm">
            Enter GitHub Username
          </h2>
          <div className="bg-surface-container p-sm flex items-center justify-between">
            <input 
              type="text" 
              placeholder="e.g. torvalds" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#010409] border-2 border-white text-white p-3 w-full font-label-sm focus:outline-none focus:border-[#238636]"
            />
          </div>
        </div>
        {/*  Action Buttons  */}
        <div className="flex flex-col sm:flex-row gap-md mt-md pt-md border-t-2 border-white">
          <button 
            onClick={handleAuthorize}
            className="flex-1 bg-[#238636] text-white font-label-sm text-label-sm uppercase py-4 border-2 border-black brutal-shadow brutal-shadow-interactive transition-none text-center">
            Authorize & Login
          </button>
          <button 
            onClick={handleCancel}
            className="flex-1 bg-zinc-800 text-white font-label-sm text-label-sm uppercase py-4 border-2 border-white brutal-shadow brutal-shadow-interactive transition-none text-center hover:bg-zinc-700">
            Cancel
          </button>
        </div>
        {/*  Disclaimer  */}
        <div className="text-center font-body-md text-sm text-zinc-500 mt-sm">
          Authorizing will redirect to{" "}
          <strong>https://ci-builder.example.com/callback</strong>
        </div>
      </div>
    </main>
  );
}
