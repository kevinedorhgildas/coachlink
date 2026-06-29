"use client";

import { useFormState } from "react-dom";
import { contactCoach } from "./actions";

export default function ContactForm({
  coachId,
  coachNom,
}: {
  coachId: string;
  coachNom: string;
}) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await contactCoach(formData);
    },
    undefined
  );

  if (state?.success) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Votre message a bien été envoyé à {coachNom}.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="coachId" value={coachId} />

      <div>
        <label htmlFor="nom" className="mb-1 block text-sm font-medium text-gray-700">
          Votre nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Votre email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder={`Bonjour, je souhaiterais des informations sur vos séances de coaching...`}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Envoyer le message
      </button>
    </form>
  );
}
