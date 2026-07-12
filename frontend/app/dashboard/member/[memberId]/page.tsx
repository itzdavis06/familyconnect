import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";

function formatDate(dateString: string | null) {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getFamilyId(token: string) {
  const res = await fetch(`${API_URL}/api/families`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const families = await res.json();
  return families.length > 0 ? families[0].id : null;
}

async function getMemberProfile(token: string, familyId: string, memberId: string) {
  const res = await fetch(
    `${API_URL}/api/families/${familyId}/members/${memberId}/profile`,
    { headers: { Cookie: `token=${token}` }, cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function MemberProfile({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return <p className="text-sm text-slate-600">Not logged in.</p>;
  }

  const familyId = await getFamilyId(token.value);
  if (!familyId) {
    return <p className="text-sm text-slate-600">No family found.</p>;
  }

  const profile = await getMemberProfile(token.value, familyId, memberId);

  if (!profile) {
    return <p className="text-sm text-slate-600">Profile not found.</p>;
  }

  return (
    <div>
      <a
        href="/dashboard/family-tree"
        className="text-sm font-medium text-navy-700 underline"
      >
        &larr; Back to Family Tree
      </a>

      <div className="mt-4 max-w-md rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-700 text-lg font-semibold text-white">
            {(profile.fullName || profile.username || "??").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-[var(--font-manrope)] font-bold text-navy-900">
              {profile.fullName || profile.username}
            </h2>
            <p className="text-sm text-slate-500">{profile.role}</p>
          </div>
        </div>

        <dl className="mt-6 flex flex-col gap-3 text-sm">
          {!profile.isChild && !profile.isAncestor && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Member since</dt>
              <dd className="font-medium text-slate-800">
                {formatDate(profile.memberSince)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-slate-500">Date of birth</dt>
            <dd className="font-medium text-slate-800">
              {formatDate(profile.dateOfBirth)}
            </dd>
          </div>
          {profile.dateOfDeath && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Date of death</dt>
              <dd className="font-medium text-slate-800">
                {formatDate(profile.dateOfDeath)}
              </dd>
            </div>
          )}
          {profile.occupation && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Occupation</dt>
              <dd className="font-medium text-slate-800">{profile.occupation}</dd>
            </div>
          )}
          {profile.location && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium text-slate-800">{profile.location}</dd>
            </div>
          )}
        </dl>

        {(profile.isChild || profile.isAncestor) && (
          <p className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-slate-500">
            {profile.isChild
              ? "Child profiles are view-only within the family."
              : "This person has passed away or is not an active member."}
          </p>
        )}
      </div>
    </div>
  );
}
