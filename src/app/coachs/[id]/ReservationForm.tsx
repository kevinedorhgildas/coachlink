"use client";

import { useFormState } from "react-dom";
import { requestReservation } from "./actions";

type Disponibilite = {
  id: string;
  jour_semaine: string;
  heure_debut: string;
  heure_fin: string;
};

export default function ReservationForm({
  coachId,
  disponibilites,
}: {
  coachId: string;
  disponibilites: Disponibilite[];
}) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await requestReservation(formData);
    },
    undefined
  );

  if (disponibilites.length === 0) {
    return null;
  }

  if (state?.success) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Votre demande de réservation a été envoyée au coach.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <input type="hidden" name="coachId" value={coachId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Créneau souhaité</label>
        <select
          name="disponibiliteId"
          required
          defaultValue=""
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            Choisir un créneau
          </option>
          {disponibilites.map((d) => (
            <option key={d.id} value={d.id}>
              {d.jour_semaine} : {d.heure_debut.slice(0, 5)} – {d.heure_fin.slice(0, 5)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Date souhaitée</label>
        <input
          name="date_souhaitee"
          type="date"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Message (optionnel)</label>
        <textarea
          name="message"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Demander une réservation
      </button>
    </form>
  );
}
