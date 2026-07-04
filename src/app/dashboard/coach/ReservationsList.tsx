"use client";

import { updateReservationStatut } from "./actions";

const GOLD = "#C9A96E";

type Reservation = {
  id: string;
  date_souhaitee: string;
  message: string | null;
  statut: "en_attente" | "confirmee" | "refusee";
  disponibilites: { jour_semaine: string; heure_debut: string; heure_fin: string } | { jour_semaine: string; heure_debut: string; heure_fin: string }[] | null;
};

const LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  refusee: "Refusée",
};

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  en_attente: { bg: "#fffbeb", color: "#92400e" },
  confirmee:  { bg: "#f0fdf4", color: "#166534" },
  refusee:    { bg: "#fef2f2", color: "#991b1b" },
};

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
            const badge = BADGE_STYLES[r.statut] ?? BADGE_STYLES.en_attente;
            return (
              <li key={r.id} className="rounded-xl border border-gray-100 p-4 transition hover:border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {dispo && (
                      <span className="ml-1 capitalize font-normal text-gray-500">
                        — {dispo.jour_semaine} {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}
                      </span>
                    )}
                  </p>
                  <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>
                    {LABELS[r.statut]}
                  </span>
                </div>

                {r.message && <p className="mt-2 text-sm italic text-gray-500">"{r.message}"</p>}

                {r.statut === "en_attente" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateReservationStatut(r.id, "confirmee")}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)", color: "white" }}
                    >
                      ✓ Confirmer
                    </button>
                    <button
                      onClick={() => updateReservationStatut(r.id, "refusee")}
                      className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      ✕ Refuser
                    </button>
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
