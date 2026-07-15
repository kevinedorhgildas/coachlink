"use client";

import { useState } from "react";
import Link from "next/link";

const GOLD = "#C9A96E";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="absolute left-0 right-0 top-0 z-20 px-6 py-5 md:px-8">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <span className="text-xl font-bold tracking-tight text-white">
          Coach<span style={{ color: GOLD }}>Link</span>
        </span>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/coachs" className="text-sm font-medium text-white/70 hover:text-white transition">Nos coachs</Link>
          <Link href="/connexion" className="text-sm font-medium text-white/70 hover:text-white transition">Se connecter</Link>
          <Link href="/inscription" className="rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#5a3e00" }}>
            Commencer
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
          aria-label="Menu">
          <span className="block w-6 h-0.5 bg-white transition-all" style={{ transform: open ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span className="block w-6 h-0.5 bg-white transition-all" style={{ opacity: open ? 0 : 1 }} />
          <span className="block w-6 h-0.5 bg-white transition-all" style={{ transform: open ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <div className="md:hidden mt-4 rounded-2xl overflow-hidden" style={{ background: "#0B1120ee", backdropFilter: "blur(12px)", border: "1px solid #ffffff15" }}>
          <Link href="/coachs" onClick={() => setOpen(false)}
            className="flex items-center px-5 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 border-b transition" style={{ borderColor: "#ffffff10" }}>
            Nos coachs
          </Link>
          <Link href="/connexion" onClick={() => setOpen(false)}
            className="flex items-center px-5 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 border-b transition" style={{ borderColor: "#ffffff10" }}>
            Se connecter
          </Link>
          <Link href="/inscription" onClick={() => setOpen(false)}
            className="flex items-center px-5 py-4 text-sm font-semibold transition hover:opacity-90" style={{ color: GOLD }}>
            Commencer →
          </Link>
        </div>
      )}
    </nav>
  );
}
