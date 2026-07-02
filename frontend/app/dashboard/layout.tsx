import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) return null;

  const res = await fetch("http://localhost:4000/api/me", {
    headers: { Cookie: `token=${token.value}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

async function getFamilies(token: string) {
  const res = await fetch("http://localhost:4000/api/families", {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.fullName) {
    redirect("/onboarding");
  }

  const families = token ? await getFamilies(token.value) : [];
  const currentFamily = families[0];

  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside className="w-56 border-r border-gray-200 bg-white p-4">
        <div className="mb-8 font-[var(--font-manrope)] text-lg font-extrabold text-navy-700">
          FamilyConnect
        </div>
        <nav className="flex flex-col gap-1">
          <a href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700">
            Dashboard
          </a>
          <a href="/dashboard/family-tree" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700">
            Family Tree
          </a>
          <a href="/dashboard/chat" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700">
            Chat
          </a>
          <a href="/dashboard/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700">
            Profile
          </a>
          <a href="/dashboard/manage-family" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700">
            Manage Family
          </a>
          <a href="/dashboard/settings" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700">
            Settings
          </a>
        </nav>
      </aside>

      <div className="flex-1">
       <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <span className="text-sm font-semibold text-navy-700">
            {currentFamily ? currentFamily.name : "No family yet"}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700">{user.username}</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}