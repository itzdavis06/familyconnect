export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-200 bg-white p-4">
        <div className="mb-8 text-lg font-bold text-slate-800">
          FamilyConnect
        </div>
        <nav className="flex flex-col gap-1">
          
            <a href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
          >
            Dashboard
          </a>
          
            <a href="/dashboard/family-tree"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
          >
            Family Tree
          </a>
          
           <a  href="/dashboard/chat"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
          >
            Chat
          </a>
          
            <a href="/dashboard/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
          >
            Profile
          </a>
            <a href="/dashboard/manage-family"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
          >
            Manage Family
          </a>
          
            <a href="/dashboard/settings"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <span className="text-sm font-medium text-slate-600">
            The Johnson Family
          </span>
          <span className="text-sm font-medium text-slate-700">
            John Doe
          </span>
        </header>

        {/* Page content goes here */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}