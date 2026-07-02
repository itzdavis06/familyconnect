"use client";

import { useEffect, useState } from "react";

interface Family {
  id: string;
  name: string;
  role: string;
}

export default function ManageFamily() {
  const [families, setFamilies] = useState<Family[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/families", { credentials: "include" })
      .then((res) => res.json())
      .then(setFamilies);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:4000/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setFamilies([{ id: data.id, name: data.name, role: "ADMIN" }]);
  }

  async function handleInvite() {
    if (!families || families.length === 0) return;

    const res = await fetch(
      `http://localhost:4000/api/families/${families[0].id}/invitations`,
      { method: "POST", credentials: "include" }
    );

    const data = await res.json();

    if (res.ok) {
      setInviteLink(`http://localhost:3000/join-family?token=${data.token}`);
    }
  }
  
  if (families === null) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (families.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create your family
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          You&apos;re not part of a family yet. Start one below.
        </p>

        <form
          onSubmit={handleCreate}
          className="mt-6 flex max-w-md flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">
              Family name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Doe Family"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create Family
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Family</h1>
          <p className="mt-1 text-sm text-slate-600">{families[0].name}</p>
        </div>
        {families[0].role === "ADMIN" && (
          <button
            onClick={handleInvite}
            className="rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Invite Member
          </button>
        )}
      </div>

      {inviteLink && (
        <div className="mt-4 max-w-2xl rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">
            Share this link — it expires in 7 days:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-slate-600"
            />
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-800">You</p>
        <p className="text-xs text-slate-500">{families[0].role}</p>
      </div>
    </div>
  );
}