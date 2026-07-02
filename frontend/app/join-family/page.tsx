export default function JoinFamily() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          You&apos;ve been invited!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Join <span className="font-semibold">The Johnson Family</span> on
          FamilyConnect.
        </p>

        <p className="mt-6 text-sm text-slate-600">
          You&apos;ll need an account to join. If you already have one, log
          in first.
        </p>

        
          <a href="/register"
          className="mt-6 block rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Create account &amp; join
        </a>
        
          <a href="/login"
          className="mt-3 block text-sm font-medium text-slate-700 underline"
        >
          I already have an account
        </a>

        <p className="mt-6 text-xs text-slate-400">
          Invitation expires in 7 days
        </p>
      </div>
    </div>
  );
}