"use client";

import { useState } from "react";
import Link from "next/link";
import { updateCoachStatut } from "./actions";

const GOLD = "#C9A96E";

type Coach = {
  id: string; nom: string; email: string; specialite: string | null;
  ville: string | null; tarif_horaire: number | null; photo_url: string | null;
  statut: string; created_at: string;
};

const STATUTS = ["actif", "en_attente", "suspendu"] as const;
const STATUT_STYLE: Record<string, { bg: string; color: string }> = {
  actif:      { bg: "#f0fdf4", color: "#166534" },
  en_attente: { bg: "#fffbeb", color: "#92400e" },
  suspendu:   { bg: "#fef2f2", color: "#991b1b" },
};

export default function CoachsAdminList({ coaches }: { coaches: Coach[] }) {
  const [list, setList] = useState(coaches);
  const [filter, setFilter] = useState<string>("tous");
  const [search, setSearch] = useState("");

  async function handleStatut(id: string, statut: string) {
    await updateCoachStatut(id, statut);
    setList((prev) => prev.map((c) => c.id === id ? { ...c, statut } : c));
  }

  const filtered = list.filter((c) => {
    if (filter !== "tous" && c.statut !== filter) return false;
    if (search && !c.nom.toLowerCase().includes(search.toLowerCase()) && !c.specialite?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Filtres */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher un coach..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition w-52"
        />
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          {["tous", ...STATUTS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition"
              style={filter === s
                ? { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }
                : { color: "#6b7280" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">Aucun coach trouvé.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: `${GOLD}0d` }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#9A7A2E" }}>Coach</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#9A7A2E" }}>Spécialité</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#9A7A2E" }}>Tarif</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#9A7A2E" }}>Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#9A7A2E" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const s = STATUT_STYLE[c.statut] ?? STATUT_STYLE.actif;
                return (
                  <tr key={c.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                          {c.photo_url
                            ? <img src={c.photo_url} alt="" className="h-full w-full object-cover" />
                            : <span className="text-gray-400 text-xs font-bold">?</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.nom}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.specialite ?? "—"}{c.ville ? ` · ${c.ville}` : ""}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "#9A7A2E" }}>{c.tarif_horaire ? `${c.tarif_horaire} €/h` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{c.statut}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/coachs/${c.id}`} target="_blank" className="rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                          Profil
                        </Link>
                        {c.statut !== "actif" && (
                          <button onClick={() => handleStatut(c.id, "actif")} className="rounded-full px-2.5 py-1 text-xs font-semibold text-white transition hover:opacity-90" style={{ background: "#16a34a" }}>
                            ✓ Activer
                          </button>
                        )}
                        {c.statut !== "suspendu" && (
                          <button onClick={() => handleStatut(c.id, "suspendu")} className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                            Suspendre
                          </button>
                        )}
                        {c.statut !== "en_attente" && (
                          <button onClick={() => handleStatut(c.id, "en_attente")} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">
                            En attente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
