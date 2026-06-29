"use client";

import { updateReservationStatut } from "./actions";

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

const STYLES: Record<string, string> = {
  en_attente: "bg-amber-50 text-amber-700",
  confirmee: "bg-green-50 text-green-700",
  refusee: "bg-red-50 text-red-700",
};

export default function ReservationsList({ reservations }: { reservations: Reservation[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Demandes de réservation</h2>

      {reservations.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune demande pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {reservations.map((r) => {
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites;
            return (
              <li key={r.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(r.date_souhaitee).toLocaleDateString("fr-FR")}
                    {dispo && (
                      <span className="capitalize text-gray-600">
                        {" "}
                        — {dispo.jour_semaine} {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}
                      </span>
                    )}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[r.statut]}`}>
                    {LABELS[r.statut]}
                  </span>
                </div>

                {r.message && <p className="mt-2 text-sm text-gray-600">{r.message}</p>}

                {r.statut === "en_attente" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateReservationStatut(r.id, "confirmee")}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => updateReservationStatut(r.id, "refusee")}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Refuser
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
