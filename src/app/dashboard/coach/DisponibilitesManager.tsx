"use client";

import { useFormState } from "react-dom";
import { addDisponibilite, deleteDisponibilite } from "./actions";

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

type Disponibilite = {
  id: string;
  jour_semaine: string;
  heure_debut: string;
  heure_fin: string;
};

export default function DisponibilitesManager({
  disponibilites,
}: {
  disponibilites: Disponibilite[];
}) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await addDisponibilite(formData);
    },
    undefined
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Disponibilités</h2>

      <ul className="mb-4 space-y-2">
        {disponibilites.length === 0 && (
          <li className="text-sm text-gray-500">Aucun créneau renseigné.</li>
        )}
        {disponibilites.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm"
          >
            <span className="capitalize">
              {d.jour_semaine} : {d.heure_debut.slice(0, 5)} – {d.heure_fin.slice(0, 5)}
            </span>
            <button
              onClick={() => deleteDisponibilite(d.id)}
              className="text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Jour</label>
          <select
            name="jour_semaine"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {JOURS.map((j) => (
              <option key={j} value={j} className="capitalize">
                {j}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">De</label>
          <input
            name="heure_debut"
            type="time"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">À</label>
          <input
            name="heure_fin"
            type="time"
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Ajouter
        </button>
      </form>

      {state?.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
    </div>
  );
}
