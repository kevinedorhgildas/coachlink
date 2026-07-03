"use client";

import { useFormState } from "react-dom";
import { login } from "@/app/auth/actions";

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function ConnexionForm() {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await login(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required placeholder="vous@exemple.com" className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>Mot de passe</label>
        <input id="password" name="password" type="password" required placeholder="••••••••" className={inputClass} />
      </div>

      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl py-3 text-sm font-semibold text-navy-900 shadow-md transition hover:opacity-90 hover:shadow-lg"
        style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120" }}
      >
        Se connecter
      </button>
    </form>
  );
}
