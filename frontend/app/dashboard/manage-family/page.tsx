export default function ManageFamily() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Manage Family</h1>
        <button className="rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white">
          + Invite Member
        </button>
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              John (You)
            </p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
        <div className="flex flex-col border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Laura</p>
            <p className="text-xs text-slate-500">Parent</p>
          </div>
        </div>
        <div className="flex flex-col border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Michael</p>
            <p className="text-xs text-slate-500">Member</p>
          </div>
        </div>
        <div className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Sarah</p>
            <p className="text-xs text-slate-500">Member</p>
          </div>
        </div>
      </div>
    </div>
  );
}