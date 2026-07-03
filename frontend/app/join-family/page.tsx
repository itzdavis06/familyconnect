"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function JoinFamilyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [familyName, setFamilyName] = useState("");

  async function handleJoin() {
    if (!token) return;
    setStatus("loading");

    const res = await fetch(`http://localhost:4000/api/invitations/${token}/accept`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Something went wrong");
      return;
    }

    setStatus("success");
    setFamilyName(data.familyName);
  }

  if (!token) {
    return (
      <p className="text-sm text-slate-600">
        This invitation link looks invalid or incomplete.
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
          Welcome!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You&apos;ve joined <span className="font-semibold">{familyName}</span>.
        </p>
        
          <a href="/dashboard"
          className="mt-6 block rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        You&apos;ve been invited!
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Join a family on FamilyConnect.
      </p>

      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">{message}</p>
      )}

      <button
        onClick={handleJoin}
        disabled={status === "loading"}
        className="mt-6 block w-full rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {status === "loading" ? "Joining..." : "Accept & Join"}
      </button>
      
        <a href="/login"
        className="mt-3 block text-sm font-medium text-slate-700 underline"
      >
        I need to log in first
      </a>
    </div>
  );
}

export default function JoinFamily() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8">
        <Suspense fallback={<p>Loading...</p>}>
          <JoinFamilyContent />
        </Suspense>
      </div>
    </div>
  );
}