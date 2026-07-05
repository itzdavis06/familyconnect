import { cookies } from "next/headers";
import Link from "next/link";
import { API_URL } from "@/lib/api";

async function getData(token: string) {
  const userRes = await fetch(`${API_URL}/api/me`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const user = await userRes.json();

  const familiesRes = await fetch(`${API_URL}/api/families`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const families = await familiesRes.json();

  if (!families.length) {
    return { user, family: null, members: [], messages: [] };
  }

  const family = families[0];

  const membersRes = await fetch(
    `${API_URL}/api/families/${family.id}/members`,
    { headers: { Cookie: `token=${token}` }, cache: "no-store" }
  );
  const members = await membersRes.json();

  const messagesRes = await fetch(
    `${API_URL}/api/families/${family.id}/messages`,
    { headers: { Cookie: `token=${token}` }, cache: "no-store" }
  );
  const messages = await messagesRes.json();

  return { user, family, members, messages };
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const { user, family, members, messages } = token
    ? await getData(token.value)
    : { user: null, family: null, members: [], messages: [] };

  const recentMessages = messages.slice(-3).reverse();
  const adultMembers = members.filter((m: any) => !m.isChild);
  const childMembers = members.filter((m: any) => m.isChild);

  return (
    <div>
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Welcome back, {user?.fullName?.split(" ")[0] || user?.username}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Here&apos;s what&apos;s happening with your family.
      </p>

      {!family ? (
        <div className="mt-6 max-w-lg rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            You&apos;re not part of a family yet.
          </p>
          <Link
            href="/dashboard/manage-family"
            className="mt-3 inline-block rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create your family
          </Link>
        </div>
      ) : (
        <>
          {/* Family summary cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Family
              </p>
              <p className="mt-1 font-[var(--font-manrope)] text-lg font-bold text-navy-900">
                {family.name}
              </p>
              <p className="text-xs text-slate-500">Role: {family.role}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Members
              </p>
              <p className="mt-1 font-[var(--font-manrope)] text-lg font-bold text-navy-900">
                {adultMembers.length}
              </p>
              <p className="text-xs text-slate-500">
                {childMembers.length} child profile
                {childMembers.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Messages
              </p>
              <p className="mt-1 font-[var(--font-manrope)] text-lg font-bold text-navy-900">
                {messages.length}
              </p>
              <p className="text-xs text-slate-500">total in group chat</p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Recent activity
            </p>
            {recentMessages.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No messages yet.{" "}
                <Link href="/dashboard/chat" className="underline">
                  Start the conversation
                </Link>
                .
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {recentMessages.map((m: any) => (
                  <div key={m.id} className="text-sm">
                    <span className="font-medium text-navy-700">
                      {m.senderName}:
                    </span>{" "}
                    <span className="text-slate-600">{m.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/family-tree"
              className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              View Family Tree
            </Link>
            <Link
              href="/dashboard/chat"
              className="rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Open Chat
            </Link>
            {family.role === "ADMIN" && (
              <Link
                href="/dashboard/manage-family"
                className="rounded-full border border-navy-700 px-5 py-2.5 text-sm font-semibold text-navy-700"
              >
                Manage Family
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}