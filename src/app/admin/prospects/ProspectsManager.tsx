"use client";

import { useState, useTransition } from "react";
import { createProspect, updateStatut, updateNotes, deleteProspect } from "./actions";

const GOLD = "#C9A96E";

const STATUTS = [
  { key: "a_contacter",  label: "À contacter",  color: "#6b7280", bg: "#f3f4f6" },
  { key: "contacte",     label: "Contacté",      color: "#2563eb", bg: "#eff6ff" },
  { key: "repondu",      label: "A répondu",     color: "#d97706", bg: "#fffbeb" },
  { key: "converti",     label: "Converti",     color: "#059669", bg: "#ecfdf5" },
  { key: "sans_suite",   label: "Sans suite",    color: "#9ca3af", bg: "#f9fafb" },
];

const CANAUX = [
  { key: "email",     label: "Email" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin",  label: "LinkedIn" },
  { key: "autre",     label: "Autre" },
];

type Prospect = {
  id: string;
  nom: string;
  contact: string;
  canal: string;
  statut: string;
  specialite: string | null;
  notes: string | null;
  code_promo: string | null;
  created_at: string;
};

export default function ProspectsManager({ prospects }: { prospects: Prospect[] }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [editNotes, setEditNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = prospects.filter((p) => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || p.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const stats = STATUTS.map((s) => ({
    ...s,
    count: prospects.filter((p) => p.statut === s.key).length,
  }));

  function handleStatut(id: string, statut: string) {
    startTransition(() => updateStatut(id, statut));
  }

  function handleNotesSave(id: string) {
    startTransition(() => updateNotes(id, notesValue));
    setEditNotes(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer ce prospect ?")) return;
    startTransition(() => deleteProspect(id));
  }

  
  const statutStyle = (s: string) => STATUTS.find((x) => x.key === s) ?? STATUTS[0];

  return (
    <div>
      {/* Stats rapides */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.key} className="rounded-xl border border-gray-200 bg-white p-3 text-center cursor-pointer transition hover:border-[#C9A96E66]"
            style={{ borderColor: filterStatut === s.key ? GOLD : undefined }}
            onClick={() => setFilterStatut(filterStatut === s.key ? "tous" : s.key)}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Barre d'actions */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Rechercher un prospect..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A96E]"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#5a3e00" }}>
          + Ajouter un prospect
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <form action={async (fd) => { await createProspect(fd); setShowForm(false); }}
          className="mb-5 rounded-2xl border border-[#C9A96E44] bg-white p-5 shadow-sm">
          <p className="font-semibold text-gray-900 mb-4">Nouveau prospect</p>
          <div className="grid grid-cols-2 gap-3">
            <input name="nom" required placeholder="Nom / pseudo *" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#C9A96E]" />
            <input name="contact" required placeholder="Email ou @handle *" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#C9A96E]" />
            <select name="canal" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#C9A96E]">
              {CANAUX.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <input name="specialite" placeholder="Spécialité (ex: coaching sportif)" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#C9A96E]" />
            <input name="code_promo" placeholder="Code promo attribué" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#C9A96E]" />
            <textarea name="notes" placeholder="Notes..." rows={2} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#C9A96E] col-span-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#5a3e00" }}>
              Enregistrer
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Tableau */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            
            <p className="text-sm font-medium">Aucun prospect pour l'instant.</p>
            <p className="text-xs mt-1">Ajoute des coachs à démarcher pour suivre ta prospection.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Coach</th>
                <th className="text-left px-4 py-3">Canal</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Code promo</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = statutStyle(p.statut);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{p.nom}</p>
                      <p className="text-xs text-gray-400">{p.contact}</p>
                      {p.specialite && <p className="text-xs text-gray-400 mt-0.5">{p.specialite}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{CANAUX.find((x) => x.key === p.canal)?.label ?? p.canal}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.statut}
                        onChange={(e) => handleStatut(p.id, e.target.value)}
                        disabled={isPending}
                        className="rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer outline-none"
                        style={{ background: st.bg, color: st.color }}>
                        {STATUTS.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {p.code_promo
                        ? <span className="rounded-full px-2 py-0.5 text-xs font-mono font-semibold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{p.code_promo}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {editNotes === p.id ? (
                        <div className="flex gap-1">
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            rows={2}
                            className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-[#C9A96E]"
                            autoFocus
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleNotesSave(p.id)} className="rounded-lg px-2 py-1 text-xs text-white" style={{ background: GOLD }}>✓</button>
                            <button onClick={() => setEditNotes(null)} className="rounded-lg px-2 py-1 text-xs bg-gray-100 text-gray-500">✕</button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-xs text-gray-500 truncate cursor-pointer hover:text-gray-800"
                          onClick={() => { setEditNotes(p.id); setNotesValue(p.notes ?? ""); }}
                          title={p.notes ?? "Cliquer pour ajouter une note"}>
                          {p.notes || <span className="text-gray-300 italic">+ note</span>}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-400 transition text-xs font-medium">Sup.</button>
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
