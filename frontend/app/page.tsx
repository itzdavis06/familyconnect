export default function Home() {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-[var(--font-manrope)] text-lg font-extrabold text-navy-700">
          Family Connect
        </span>
        <nav className="flex items-center gap-4">
          <a href="/login" className="text-sm font-medium text-slate-700">
            Log in
          </a>
          
            <a href="/register"
            className="rounded-full bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Get started
          </a>
        </nav>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-[var(--font-manrope)] text-4xl font-extrabold text-navy-900">
          Your family&apos;s private corner of the internet.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Build your family tree, message safely, and keep everyone
          connected in one place.
        </p>
        
          <a href="/register"
          className="mt-8 inline-block rounded-full bg-navy-700 px-6 py-3 text-sm font-semibold text-white"
        >
          Create your family
        </a>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600" />
            <h3 className="mt-3 font-[var(--font-manrope)] font-bold text-navy-900">
              Family tree
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              See how everyone connects, generation by generation.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-navy-700" />
            <h3 className="mt-3 font-[var(--font-manrope)] font-bold text-navy-900">
              Encrypted chat
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              1-to-1 and group messages, readable only by your family.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            <h3 className="mt-3 font-[var(--font-manrope)] font-bold text-navy-900">
              Role-based access
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Admins, parents, and members each see exactly what they should.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600" />
            <h3 className="mt-3 font-[var(--font-manrope)] font-bold text-navy-900">
              Child profiles
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Kids get a place in the tree without a login or a way to be
              messaged by strangers.
            </p>
          </div>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
        © 2026 FamilyConnect
      </footer>
    </div>
  );
}



