"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Family {
  id: string;
  name: string;
  role: string;
}

interface Member {
  id: string | null;
  memberId: string;
  username: string | null;
  fullName: string | null;
  role: string;
  parentMemberId: string | null;
  isChild: boolean;
  isAncestor: boolean;
  dateOfDeath: string | null;
}

export default function ManageFamily() {
  const [families, setFamilies] = useState<Family[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
 const [childName, setChildName] = useState("");
  const [childDob, setChildDob] = useState("");
  const [childError, setChildError] = useState("");
  const [ancestorName, setAncestorName] = useState("");
  const [ancestorDob, setAncestorDob] = useState("");
  const [ancestorDod, setAncestorDod] = useState("");
  const [ancestorChildId, setAncestorChildId] = useState("");
  const [ancestorError, setAncestorError] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");

 useEffect(() => {
    fetch(`${API_URL}/api/families`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setFamilies);
  }, []);

  useEffect(() => {
    if (!families || families.length === 0) return;
    loadMembers();
  }, [families]);

  useEffect(() => {
    fetch(`${API_URL}/api/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((user) => setCurrentUsername(user.username));
  }, []);

  async function loadMembers() {
    if (!families || families.length === 0) return;
    const res = await fetch(
      `${API_URL}/api/families/${families[0].id}/members`,
      { credentials: "include" }
    );
    if (res.ok) setMembers(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`${API_URL}/api/families`, {
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
      `${API_URL}/api/families/${families[0].id}/invitations`,
      { method: "POST", credentials: "include" }
    );

    const data = await res.json();

    if (res.ok) {
      setInviteLink(`${window.location.origin}/join-family?token=${data.token}`);
    }
  }

 async function handleAddParent(memberUserId: string, parentUserId: string) {
      if (!families || families.length === 0 || !parentUserId) return;
      const res = await fetch(
        `${API_URL}/api/families/${families[0].id}/members/${memberUserId}/parents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ parentUserId }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }
      loadMembers();
    }

    async function handleRemoveParent(memberUserId: string, parentUserId: string) {
      if (!families || families.length === 0) return;
      await fetch(
        `${API_URL}/api/families/${families[0].id}/members/${memberUserId}/parents/${parentUserId}`,
        { method: "DELETE", credentials: "include" }
      );
      loadMembers();
    }

  async function handleRemoveMember(membershipId: string) {
    if (!families || families.length === 0) return;
    if (!confirm("Remove this member from the family?")) return;

    const res = await fetch(
      `${API_URL}/api/families/${families[0].id}/members/by-membership/${membershipId}`,
      { method: "DELETE", credentials: "include" }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    loadMembers();
  }

  async function handleLeaveFamily() {
    if (!families || families.length === 0) return;
    if (!confirm("Are you sure you want to leave this family?")) return;

    const res = await fetch(
      `${API_URL}/api/families/${families[0].id}/leave`,
      { method: "POST", credentials: "include" }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault();
    setChildError("");

    if (!families || families.length === 0) return;

    const res = await fetch(
      `${API_URL}/api/families/${families[0].id}/children`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName: childName, dateOfBirth: childDob }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setChildError(data.error || "Something went wrong");
      return;
    }

    setChildName("");
    setChildDob("");
    loadMembers();
  }

  async function handleAddAncestor(e: React.FormEvent) {
    e.preventDefault();
    setAncestorError("");

    if (!families || families.length === 0) return;

    const res = await fetch(`${API_URL}/api/families/${families[0].id}/ancestors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName: ancestorName,
        dateOfBirth: ancestorDob || null,
        dateOfDeath: ancestorDod || null,
        childMemberId: ancestorChildId || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAncestorError(data.error || "Something went wrong");
      return;
    }

    setAncestorName("");
    setAncestorDob("");
    setAncestorDod("");
    setAncestorChildId("");
    loadMembers();
  }

  if (families === null) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (families.length === 0) {
    return (
      <div>
        <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
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

  const isAdmin = families[0].role === "ADMIN";

  return (
    <div>
     <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Family</h1>
          <p className="mt-1 text-sm text-slate-600">{families[0].name}</p>
        </div>
        {isAdmin ? (
          <button
            onClick={handleInvite}
            className="rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Invite Member
          </button>
        ) : (
          <button
            onClick={handleLeaveFamily}
            className="rounded-full border border-red-600 px-5 py-2.5 text-sm font-semibold text-red-600"
          >
            Leave Family
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
              onClick={(e) => {
                const input = (e.target as HTMLElement)
                  .closest("div")
                  ?.querySelector("input") as HTMLInputElement;
                if (input) {
                  input.select();
                  document.execCommand("copy");
                }
              }}
              className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Copy
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            
             <a href={`https://wa.me/?text=${encodeURIComponent(
                `Join our family on FamilyConnect: ${inviteLink}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white"
            >
              WhatsApp
            </a>
            
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                inviteLink
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-navy-700 px-4 py-2 text-xs font-semibold text-white"
            >
              Facebook
            </a>
            
            <a href={`mailto:?subject=${encodeURIComponent(
                "Join our family on FamilyConnect"
              )}&body=${encodeURIComponent(
                `You've been invited to join our family on FamilyConnect: ${inviteLink}`
              )}`}
              className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Email
            </a>
          </div>
        </div>
      )}
     {isAdmin && (
        <form
          onSubmit={handleAddChild}
          className="mt-6 flex max-w-2xl flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
        >
          <div>
            <label className="text-xs font-medium text-slate-700">
              Child&apos;s full name{" "} 

            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">
              Date of birth{" "}  
            </label>
            <input
              type="date"
              value={childDob}
              onChange={(e) => setChildDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Add Child Profile
          </button>
          {childError && (
            <p className="w-full text-sm text-red-600">{childError}</p>
          )}
        </form>
      )}

{isAdmin && (
        <form
          onSubmit={handleAddAncestor}
          className="mt-4 flex max-w-2xl flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
        >
          <div>
            <label className="text-xs font-medium text-slate-700">
              Ancestor&apos;s full name{" "} 
            </label>
            <input
              type="text"
              value={ancestorName}
              onChange={(e) => setAncestorName(e.target.value)}
              placeholder="e.g. Great Grandma Rose"
              required
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">
              Born (optional){" "} 
            </label>
            <input
              type="date"
              value={ancestorDob}
              onChange={(e) => setAncestorDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">
              Died (optional){" "} 
            </label>
            <input
              type="date"
              value={ancestorDod}
              onChange={(e) => setAncestorDod(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">
              Parent of{" "} 
            </label>
            <select
              value={ancestorChildId}
              onChange={(e) => setAncestorChildId(e.target.value)}
              className="mt-1 rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              <option value="">No one yet</option>
              {members
                .filter((m) => !m.isChild && !m.isAncestor)
                .map((m) => (
                  <option key={m.memberId} value={m.memberId}>
                    {m.fullName || m.username}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-slate-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Add Ancestor
          </button>
          {ancestorError && (
            <p className="w-full text-sm text-red-600">{ancestorError}</p>
          )}
        </form>
      )}

      <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white">
        {members.map((m) => (
          <div
            key={m.memberId}
            className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {m.fullName || m.username}
              </p>
              <p className="text-xs text-slate-500">{m.role}</p>
            </div>

            {isAdmin && !m.isChild && !m.isAncestor && (
              <div>
                  <label className="mr-2 text-xs text-slate-500">Parent:</label>
                <select
                  value={m.parentMemberId ? (findUserIdByMemberId(members, m.parentMemberId) || "") : ""}
                <div className="mt-1 flex flex-wrap items-center gap-1">
                    {(m.parentMemberIds || []).map((pid) => {
                      const parentMember = members.find(
                        (candidate) => candidate.memberId === pid
                      );
                      return (
                        <span
                          key={pid}
                          className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-slate-700"
                        >
                          {parentMember?.fullName || parentMember?.username || "Unknown"}
                          <button
                            onClick={() => handleRemoveParent(m.id!, parentMember?.id!)}
                            className="text-red-500"
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                    <select
                      value=""
                      onChange={(e) => handleAddParent(m.id!, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="">+ Add parent</option>
                      {members
                        .filter(
                          (candidate) =>
                            !candidate.isChild &&
                            candidate.id !== m.id &&
                            !(m.parentMemberIds || []).includes(candidate.memberId)
                        )
                        .map((candidate) => (
                          <option key={candidate.memberId} value={candidate.id || candidate.memberId}>
                            {candidate.fullName || candidate.username}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

           {isAdmin && m.username !== currentUsername && (
              <button
                onClick={() => handleRemoveMember(m.memberId)}
                className="ml-3 text-xs font-medium text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function findUserIdByMemberId(members: Member[], memberId: string) {
  const found = members.find((m) => m.memberId === memberId);
  return found?.id || "";
}



