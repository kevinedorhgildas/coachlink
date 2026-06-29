"use client";

import { useFormState } from "react-dom";
import { addAvis } from "./actions";

export default function AvisForm({ coachId }: { coachId: string }) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await addAvis(formData);
    },
    undefined
  );

  if (state?.success) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Merci, votre avis a bien été enregistré.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <input type="hidden" name="coachId" value={coachId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Votre note</label>
        <select
          name="note"
          required
          defaultValue=""
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            Choisir une note
          </option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {"★".repeat(n)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Commentaire (optionnel)</label>
        <textarea
          name="commentaire"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Publier mon avis
      </button>
    </form>
  );
}
