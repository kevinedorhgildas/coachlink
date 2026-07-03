"use client";

import { useState } from "react";
import { sInscrireNewsletter } from "@/app/newsletter/actions";

export default function NewsletterForm() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const res = await sInscrireNewsletter(formData);
    setResult(res);
    if (res.success) (e.target as HTMLFormElement).reset();
    setPending(false);
  };

  return (
    <div className="border-t border-gray-100 pt-6 mt-4 text-center">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Newsletter CoachLink</p>
      <p className="text-xs text-gray-400 mb-3">Conseils, nouveautés et offres exclusives directement dans votre boîte mail.</p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-center gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Votre adresse email"
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {pending ? "..." : "S'inscrire"}
        </button>
      </form>
      {result?.error && <p className="mt-2 text-xs text-red-500">{result.error}</p>}
      {result?.success && <p className="mt-2 text-xs text-emerald-600">✓ Inscription confirmée ! Vérifiez votre boîte mail.</p>}
    </div>
  );
}
