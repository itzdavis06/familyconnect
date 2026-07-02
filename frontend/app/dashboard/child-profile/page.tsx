export default function ChildProfile() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Child Profile</h1>

      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-slate-700">
          EJ
        </div>
        <h2 className="mt-3 font-bold text-slate-900">Emily Johnson</h2>
        <span className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Child Profile
        </span>

        <dl className="mt-6 flex flex-col gap-3 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Date of Birth</dt>
            <dd className="font-medium text-slate-800">May 15, 2018</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Created By</dt>
            <dd className="font-medium text-slate-800">Laura Johnson</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Added On</dt>
            <dd className="font-medium text-slate-800">Jun 2, 2023</dd>
          </div>
        </dl>

        <p className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-slate-500">
          Child profiles cannot log in or send messages. They are view-only
          within the family.
        </p>

        <button className="mt-6 w-full rounded-full border border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-800">
          Edit Child Profile
        </button>
      </div>
    </div>
  );
}