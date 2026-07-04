"use client";

import { useState } from "react";
import Link from "next/link";

const GOLD = "#C9A96E";

export default function SpaceSelector({ role }: { role: string }) {
  const [open, setOpen] = useState(false);

  const options = [
    { href: "/dashboard/coach", label: "Espace coach", icon: "🧑‍💼", active: true },
    ...(role === "admin" ? [{ href: "/admin/dashboard", label: "Espace admin", icon: "⚙️", active: false }] : []),
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80"
        style={{ background: `${GOLD}22`, color: "#9A7A2E" }}
      >
        Espace coach
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {options.map((o) => (
              <Link
                key={o.href}
                href={o.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                style={o.active ? { color: "#9A7A2E" } : { color: "#374151" }}
              >
                <span>{o.icon}</span>
                {o.label}
                {o.active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
