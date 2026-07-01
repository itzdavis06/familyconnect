export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Start building your family's private space.
        </p>

        <form className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-slate-900 underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}