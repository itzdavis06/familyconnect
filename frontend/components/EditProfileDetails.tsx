"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

interface UserData {
  fullName: string | null;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  location: string | null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toInputDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
}

export default function EditProfileDetails({ initialUser }: { initialUser: UserData }) {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [fullName, setFullName] = useState(initialUser.fullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(toInputDate(initialUser.dateOfBirth));
  const [email, setEmail] = useState(initialUser.email || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [occupation, setOccupation] = useState(initialUser.occupation || "");
  const [location, setLocation] = useState(initialUser.location || "");
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`${API_URL}/api/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fullName, dateOfBirth, email, phone, occupation, location }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setUser({ fullName, dateOfBirth, email, phone, occupation, location });
    setEditing(false);
  }

  if (!editing) {
    return (
      <>
        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Date of birth</dt>
            <dd className="font-medium text-slate-800">{formatDate(user.dateOfBirth)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user.email || "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-800">{user.phone || "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Occupation</dt>
            <dd className="font-medium text-slate-800">{user.occupation || "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Location</dt>
            <dd className="font-medium text-slate-800">{user.location || "Not set"}</dd>
          </div>
        </dl>
        <button
          onClick={() => setEditing(true)}
          className="mt-4 rounded-full border border-navy-700 px-4 py-2 text-xs font-semibold text-navy-700 hover:bg-gray-50"
        >
          Edit details
        </button>
      </>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-6 flex flex-col gap-3">
      <div>
        <label className="text-xs font-medium text-slate-700">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-700">Date of birth</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-700">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-700">Occupation</label>
        <input
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-700">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-navy-700 px-4 py-2 text-xs font-semibold text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}