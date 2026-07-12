"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroupe } from "./actions";

const GOLD = "#C9A96E";

export default function CreateGroupeForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await createGroupe(fd);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setOpen(false);
    if (res.id) router.push(`/dashboard/coach/groupes/${res.id}`);
    else router.refresh();
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
      >
        {open ? "Annuler" : "+ Nouveau groupe"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Créer un groupe</h3>
          {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Nom du groupe</label>
              <input name="nom" required placeholder="Ex: Groupe cardio juillet" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Description (optionnel)</label>
              <textarea name="description" rows={2} placeholder="De quoi parle ce groupe ?" className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={loading}
              className="rounded-xl px-5 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
