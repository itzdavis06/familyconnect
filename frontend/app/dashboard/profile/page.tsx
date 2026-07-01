export default function Profile() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-slate-700">
            JD
          </div>
          <div>
            <h2 className="font-bold text-slate-900">John Doe</h2>
            <p className="text-sm text-slate-500">Admin</p>
          </div>
        </div>

        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium text-slate-800">Family Admin</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Member since</dt>
            <dd className="font-medium text-slate-800">May 12, 2023</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-800">+1 (555) 123-4567</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">john@example.com</dd>
          </div>
        </dl>

        <button className="mt-6 w-full rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white">
          Edit Profile
        </button>
      </div>
    </div>
  );
}