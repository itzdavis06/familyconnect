"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

     if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
            Account created!
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You can now log in as {username}.
          </p>
          
            <a href="/login"
            className="mt-6 block rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Start building your family&apos;s private space.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters, one uppercase letter, one number
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-navy-700 underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}



