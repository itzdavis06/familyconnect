"use client";

export default function Settings() {
  async function handleLogout() {
    await fetch("http://localhost:4000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  }

  return (
    <div>
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Settings
      </h1>

      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Account
          </p>
          <button className="mt-2 block w-full py-2 text-left text-sm text-slate-700">
            Change Password
          </button>
          <button className="block w-full py-2 text-left text-sm text-red-600">
            Delete Account
          </button>
        </div>

        <div className="border-b border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            App
          </p>
          <button className="mt-2 block w-full py-2 text-left text-sm text-slate-700">
            Privacy &amp; Security
          </button>
          <button className="block w-full py-2 text-left text-sm text-slate-700">
            Notifications
          </button>
          <button className="block w-full py-2 text-left text-sm text-slate-700">
            Help &amp; Support
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="block w-full py-2 text-left text-sm font-medium text-red-600"
          >
            Log Out
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">FamilyConnect v1.0.0</p>
    </div>
  );
}