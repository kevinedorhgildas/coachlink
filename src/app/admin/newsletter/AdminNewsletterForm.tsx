"use client";

import { useState } from "react";
import { envoyerNewsletter } from "@/app/newsletter/actions";

export default function AdminNewsletterForm() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; envoyes?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const res = await envoyerNewsletter(formData);
    setResult(res);
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe admin</label>
        <input name="mot_de_passe" type="password" required className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Sujet</label>
        <input name="sujet" type="text" required placeholder="Ex. Nos nouveautés de juillet 🎉" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Contenu</label>
        <textarea name="contenu" required rows={8} placeholder="Rédigez votre newsletter ici..." className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none resize-none" />
      </div>

      {result?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{result.error}</p>}
      {result?.success && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">✓ Newsletter envoyée à {result.envoyes} abonné{(result.envoyes ?? 0) > 1 ? "s" : ""} !</p>}

      <button type="submit" disabled={sending} className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition">
        {sending ? "Envoi en cours..." : "Envoyer la newsletter"}
      </button>
    </form>
  );
}
