"use client";

import { useState } from "react";
import { addMembre, removeMembre } from "../actions";

const GOLD = "#C9A96E";

type Personne = { id: string; nom: string; email: string };

export default function MembreManager({
  groupeId, membres: initial, clientsDisponibles,
}: {
  groupeId: string;
  membres: Personne[];
  clientsDisponibles: Personne[];
}) {
  const [membres, setMembres] = useState(initial);
  const [disponibles, setDisponibles] = useState(clientsDisponibles);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAdd(client: Personne) {
    setLoading(client.id);
    await addMembre(groupeId, client.id);
    setMembres((p) => [...p, client]);
    setDisponibles((p) => p.filter((c) => c.id !== client.id));
    setLoading(null);
  }

  async function handleRemove(client: Personne) {
    setLoading(client.id);
    await removeMembre(groupeId, client.id);
    setMembres((p) => p.filter((m) => m.id !== client.id));
    setDisponibles((p) => [...p, client]);
    setLoading(null);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100" style={{ background: `${GOLD}0d` }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9A7A2E" }}>Membres</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2">
        {membres.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">Aucun client ajouté.</p>
        )}
        {membres.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-2 px-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>
                {m.nom.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{m.nom}</p>
            </div>
            <button onClick={() => handleRemove(m)} disabled={loading === m.id}
              className="text-xs text-gray-300 hover:text-red-400 transition disabled:opacity-40">
              ✕
            </button>
          </div>
        ))}
      </div>

      {disponibles.length > 0 && (
        <div className="border-t border-gray-100 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Ajouter</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {disponibles.map((c) => (
              <button key={c.id} onClick={() => handleAdd(c)} disabled={loading === c.id}
                className="w-full flex items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
                <span className="h-6 w-6 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {c.nom.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{c.nom}</span>
                <span className="ml-auto text-gray-300">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
