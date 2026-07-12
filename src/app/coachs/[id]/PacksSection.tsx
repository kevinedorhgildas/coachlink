"use client";

import { useState } from "react";
import { acheterPack } from "./packActions";

const GOLD = "#C9A96E";

type Pack = { id: string; nom: string; description: string | null; nb_seances: number; prix: number };

export default function PacksSection({ packs, coachId }: { packs: Pack[]; coachId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (packs.length === 0) return null;

  async function handleAchat(packId: string) {
    setLoading(packId);
    setError(null);
    setSuccess(null);
    const res = await acheterPack(packId, coachId);
    if (res.error) setError(res.error);
    else setSuccess(packId);
    setLoading(null);
  }

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-xl font-bold text-gray-900">Packs de séances</h2>
      <p className="mb-5 text-sm text-gray-500">Achetez plusieurs séances à la fois à un tarif préférentiel.</p>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => {
          const prixParSeance = (pack.prix / pack.nb_seances).toFixed(0);
          const acheté = success === pack.id;

          return (
            <div key={pack.id} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md" style={{ borderColor: `${GOLD}44` }}>
              <div className="mb-1">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>
                  {pack.nb_seances} séances
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-gray-900">{pack.nom}</h3>
              {pack.description && <p className="mt-1 text-xs text-gray-500">{pack.description}</p>}

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pack.prix} €</p>
                  <p className="text-xs text-gray-400">{prixParSeance} € / séance</p>
                </div>
              </div>

              <button
                onClick={() => handleAchat(pack.id)}
                disabled={loading === pack.id || acheté}
                className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={acheté
                  ? { background: "#f0fdf4", color: "#166534" }
                  : { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
              >
                {loading === pack.id ? "Traitement..." : acheté ? "✓ Pack acheté !" : "Acheter ce pack"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
