export default function FamilyTree() {
  return (
    <div>
     <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Family Tree
      </h1>
      <p className="mt-1 text-sm text-slate-600">The Johnson Family</p>

      <div className="mt-8 flex flex-col items-center gap-6">
        {/* Row 1 */}
        <div className="flex gap-12">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ring-navy-600">
              JD
            </div>
            <span className="text-sm font-medium text-slate-700">John</span>
            <span className="text-xs text-slate-500">Admin</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ring-navy-600">
              LJ
            </div>
            <span className="text-sm font-medium text-slate-700">Laura</span>
            <span className="text-xs text-slate-500">Parent</span>
          </div>
        </div>

        {/* Connector */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Row 2 */}
        <div className="flex gap-12">
          <div className="flex flex-col items-center gap-1">
           <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ring-green-600">
              MJ
            </div>
            <span className="text-sm font-medium text-slate-700">Michael</span>
            <span className="text-xs text-slate-500">Member</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ring-green-600">
              SJ
            </div>
            <span className="text-sm font-medium text-slate-700">Sarah</span>
            <span className="text-xs text-slate-500">Member</span>
          </div>
        </div>

        {/* Connector */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Row 3 */}
        <div className="flex flex-col items-center gap-1">
         <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ring-amber-400">
            EJ
          </div>
          <span className="text-sm font-medium text-slate-700">Emily</span>
          <span className="text-xs text-slate-500">Child Profile</span>
        </div>
      </div>
    </div>
  );
}