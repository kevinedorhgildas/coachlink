"use client";

import { useState } from "react";
import { updateReservationStatut, updateLienVisio } from "./actions";

const GOLD = "#C9A96E";

type Reservation = {
  id: string;
  date_souhaitee: string;
  message: string | null;
  statut: "en_attente" | "confirmee" | "refusee";
  type_seance?: string | null;
  lien_visio?: string | null;
  disponibilites: { jour_semaine: string; heure_debut: string; heure_fin: string } | { jour_semaine: string; heure_debut: string; heure_fin: string }[] | null;
};

const LABELS: Record<string, string> = { en_attente: "En attente", confirmee: "Confirmée", refusee: "Refusée" };
const TYPE_LABELS: Record<string, string> = { individuel: "Individuel", groupe: "Groupe", enligne: "En ligne" };
const BADGE: Record<string, { bg: string; color: string }> = {
  en_attente: { bg: "#fffbeb", color: "#92400e" },
  confirmee:  { bg: "#f0fdf4", color: "#166534" },
  refusee:    { bg: "#fef2f2", color: "#991b1b" },
};

function VisioInput({ reservationId, current }: { reservationId: string; current: string | null | undefined }) {
  const [val, setVal] = useState(current ?? "");
  const [saved, setSaved] = useState(false);
  async function save() {
    await updateLienVisio(reservationId, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div className="mt-3 flex gap-2">
      <input
        type="url"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://meet.google.com/..."
        className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#C9A96E] transition"
      />
      <button onClick={save} className="rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
        {saved ? "✓ Sauvé" : "Sauver"}
      </button>
    </div>
  );
}

export default function ReservationsList({ reservations }: { reservations: Reservation[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Demandes de réservation</h2>

      {reservations.length === 0 ? (
        <div className="rounded-xl px-4 py-8 text-center" style={{ background: `${GOLD}08` }}>
          <p className="text-sm text-gray-400">Aucune demande pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reservations.map((r) => {
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites;
            const badge = BADGE[r.statut] ?? BADGE.en_attente;
            return (
              <li key={r.id} className="rounded-xl border border-gray-100 p-4 transition hover:border-gray-200">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      {dispo && <span className="ml-1 capitalize font-normal text-gray-500">— {dispo.heure_debut.slice(0,5)}–{dispo.heure_fin.slice(0,5)}</span>}
                    </p>
                    {r.type_seance && (
                      <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[r.type_seance] ?? r.type_seance}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>
                    {LABELS[r.statut]}
                  </span>
                </div>

                {r.message && <p className="mt-2 text-sm italic text-gray-500">"{r.message}"</p>}

                {r.statut === "en_attente" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => updateReservationStatut(r.id, "confirmee")} className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)" }}>
                      ✓ Confirmer
                    </button>
                    <button onClick={() => updateReservationStatut(r.id, "refusee")} className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                      ✕ Refuser
                    </button>
                  </div>
                )}

                {r.statut === "confirmee" && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Lien visioconférence :</p>
                    {r.lien_visio && (
                      <a href={r.lien_visio} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:underline truncate block" style={{ color: "#9A7A2E" }}>{r.lien_visio}</a>
                    )}
                    <VisioInput reservationId={r.id} current={r.lien_visio} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
