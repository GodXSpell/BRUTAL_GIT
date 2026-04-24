"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (token && userId) {
      localStorage.setItem("stackmatch_token", token);
      localStorage.setItem("stackmatch_user_id", userId);
      // Remove the old mock user to enforce backend usage
      localStorage.removeItem("github_user");
      router.push("/dashboard");
    } else {
      router.push("/oauth");
    }
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-2xl bg-surface border-4 border-white brutal-shadow p-lg flex flex-col items-center justify-center gap-md">
      <span className="material-symbols-outlined text-[64px] text-[#7bdb80] animate-spin">
        refresh
      </span>
      <h2 className="font-headline-lg text-2xl uppercase text-white">
        Authenticating...
      </h2>
      <p className="font-body-md text-zinc-400">
        Connecting your GitHub profile with the backend securely.
      </p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <main className="flex-grow flex items-center justify-center p-md">
      <Suspense fallback={<div>Loading...</div>}>
        <OAuthCallbackContent />
      </Suspense>
    </main>
  );
}