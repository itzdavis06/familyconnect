"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";

function OnboardingForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`${API_URL}/api/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName,
        dateOfBirth,
        email,
        phone,
        occupation,
        location,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    window.location.href = redirectTo ? decodeURIComponent(redirectTo) : "/dashboard";
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8">
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Complete your profile
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Tell your family a bit about yourself.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Date of birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Occupation / activity
          </label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Teacher, Student, Retired"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. London, UK"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default function Onboarding() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-cream-50 px-4 py-12">
      <Suspense fallback={<p>Loading...</p>}>
        <OnboardingForm />
      </Suspense>
    </div>
  );
}

