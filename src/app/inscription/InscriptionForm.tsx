"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { signup } from "@/app/auth/actions";

type Role = "coach" | "client";

export default function InscriptionForm() {
  const [role, setRole] = useState<Role>("client");
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await signup(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="role" value={role} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            role === "client"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          Je cherche un coach
        </button>
        <button
          type="button"
          onClick={() => setRole("coach")}
          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            role === "coach"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          Je suis coach
        </button>
      </div>

      <div>
        <label htmlFor="nom" className="mb-1 block text-sm font-medium text-gray-700">
          Nom complet
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
          Email
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
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Créer mon compte
      </button>
    </form>
  );
}
