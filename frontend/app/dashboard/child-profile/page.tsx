import { cookies } from "next/headers";

async function getFirstChild(token: string) {
  const familiesRes = await fetch("http://localhost:4000/api/families", {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const families = await familiesRes.json();
  if (!families.length) return null;

  const membersRes = await fetch(
    `http://localhost:4000/api/families/${families[0].id}/members`,
    { headers: { Cookie: `token=${token}` }, cache: "no-store" }
  );
  const members = await membersRes.json();

  return members.find((m: any) => m.isChild) || null;
}

export default async function ChildProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const child = token ? await getFirstChild(token.value) : null;

  if (!child) {
    return (
      <p className="text-sm text-slate-600">
        No child profiles yet.{" "}
        <a href="/dashboard/manage-family" className="underline">
          Add one
        </a>
        .
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Child Profile</h1>

      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-slate-700">
          {child.fullName.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="mt-3 font-bold text-slate-900">{child.fullName}</h2>
        <span className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Child Profile
        </span>

        <p className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-slate-500">
          Child profiles cannot log in or send messages. They are view-only
          within the family.
        </p>
      </div>
    </div>
  );
}