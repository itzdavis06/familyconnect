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
      <h1 className="text-2xl font-bold text-slate-900">Manage Family</h1>
      <p className="mt-1 text-sm text-slate-600">{families[0].name}</p>

      <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-800">You</p>
        <p className="text-xs text-slate-500">{families[0].role}</p>
      </div>
    </div>
  );
}