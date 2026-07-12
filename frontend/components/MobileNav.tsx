"use client";

import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/family-tree", label: "Family Tree" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/manage-family", label: "Manage Family" },
  { href: "/dashboard/child-profile", label: "Child Profiles" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-navy-700"
        aria-label="Open menu"
      >
        &#9776;
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="w-64 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-manrope)] text-lg font-extrabold text-navy-700">
                FamilyConnect
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                &times;
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-green-100 hover:text-navy-700"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}