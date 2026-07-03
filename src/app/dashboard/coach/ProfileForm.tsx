"use client";

import { useFormState } from "react-dom";
import { updateCoachProfile } from "./actions";

type Coach = {
  specialite: string | null;
  ville: string | null;
  tarif_horaire: number | null;
  description: string | null;
};

export default function ProfileForm({ coach }: { coach: Coach }) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await updateCoachProfile(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label htmlFor="specialite" className="mb-1 block text-sm font-medium text-gray-700">
          Domaine du coach
        </label>
        <input
          id="specialite"
          name="specialite"
          type="text"
          defaultValue={coach.specialite ?? ""}
          required
          placeholder="Rechercher ou saisir un domaine..."
          list="domaines-list"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <datalist id="domaines-list">
          <option value="Coach sportif" />
          <option value="Coach en finance" />
          <option value="Coach en développement personnel" />
          <option value="Coach marketing" />
          <option value="Coach en développement business" />
          <option value="Coach mental" />
          <option value="Coach en séduction" />
          <option value="Coach en bien être et santé" />
          <option value="Coach en langue" />
        </datalist>
      </div>

      <div>
        <label htmlFor="ville" className="mb-1 block text-sm font-medium text-gray-700">
          Ville
        </label>
        <input
          id="ville"
          name="ville"
          type="text"
          defaultValue={coach.ville ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="tarif_horaire" className="mb-1 block text-sm font-medium text-gray-700">
          Tarif horaire (€)
        </label>
        <input
          id="tarif_horaire"
          name="tarif_horaire"
          type="number"
          min={0}
          step="0.5"
          defaultValue={coach.tarif_horaire ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={coach.description ?? ""}
          placeholder="Présentez votre expérience, votre approche..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          Profil mis à jour avec succès.
        </p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Enregistrer
      </button>
    </form>
  );
}
