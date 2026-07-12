"use client";

import { useState } from "react";
import { createPack, togglePack, deletePack } from "./actions";

const GOLD = "#C9A96E";

type Pack = {
  id: string;
  nom: string;
  description: string | null;
  nb_seances: number;
  prix: number;
  actif: boolean;
};

export default function PacksManager({ packs: initial }: { packs: Pack[] }) {
  const [packs, setPacks] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("create");
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await createPack(fd);
    if (res.error) { setError(res.error); setLoading(null); return; }
    (e.target as HTMLFormElement).reset();
    setShowForm(false);
    setLoading(null);
    window.location.reload();
  }

  async function handleToggle(id: string, actif: boolean) {
    setLoading(id);
    await togglePack(id, !actif);
    setPacks((prev) => prev.map((p) => p.id === id ? { ...p, actif: !actif } : p));
    setLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce pack ?")) return;
    setLoading(id + "_del");
    await deletePack(id);
    setPacks((prev) => prev.filter((p) => p.id !== id));
    setLoading(null);
  }

  return (
    <div>
      {/* Bouton ajouter */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
        >
          {showForm ? "Annuler" : "+ Nouveau pack"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Créer un pack</h3>
          {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Nom du pack</label>
              <input name="nom" required placeholder="Ex: Pack 5 séances" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" style={{ focusBorderColor: GOLD } as React.CSSProperties} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre de séances</label>
              <input name="nb_seances" type="number" min="1" required placeholder="5" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Prix (€)</label>
              <input name="prix" type="number" min="0" step="0.01" required placeholder="200" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Description (optionnel)</label>
              <textarea name="description" rows={2} placeholder="Ce que comprend ce pack..." className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading === "create"}
              className="rounded-xl px-5 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
            >
              {loading === "create" ? "Création..." : "Créer le pack"}
            </button>
          </div>
        </form>
      )}

      {/* Liste des packs */}
      {packs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-3xl mb-3">📦</p>
          <p className="text-sm font-medium text-gray-500">Aucun pack créé pour l'instant.</p>
          <p className="text-xs text-gray-400 mt-1">Créez votre premier pack pour proposer des séances groupées à vos clients.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => {
            const prixParSeance = (pack.prix / pack.nb_seances).toFixed(0);
            return (
              <div key={pack.id} className="rounded-2xl border bg-white p-5 shadow-sm transition" style={{ borderColor: pack.actif ? `${GOLD}44` : "#e5e7eb" }}>
                {/* Badge statut */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{pack.nom}</h3>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={pack.actif ? { background: "#f0fdf4", color: "#166534" } : { background: "#f3f4f6", color: "#6b7280" }}>
                    {pack.actif ? "Actif" : "Inactif"}
                  </span>
                </div>

                {pack.description && <p className="mb-3 text-xs text-gray-500">{pack.description}</p>}

                {/* Prix & séances */}
                <div className="mb-4 flex items-end gap-3">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#0B1120" }}>{pack.prix} €</p>
                    <p className="text-xs text-gray-400">{pack.nb_seances} séance{pack.nb_seances > 1 ? "s" : ""} · {prixParSeance} €/séance</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(pack.id, pack.actif)}
                    disabled={loading === pack.id}
                    className="flex-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50"
                    style={pack.actif
                      ? { borderColor: "#fca5a5", color: "#dc2626", background: "#fef2f2" }
                      : { borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}
                  >
                    {loading === pack.id ? "..." : pack.actif ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => handleDelete(pack.id)}
                    disabled={loading === pack.id + "_del"}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                  >
                    {loading === pack.id + "_del" ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
