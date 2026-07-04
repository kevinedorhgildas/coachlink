"use client";

import { useState } from "react";
import { envoyerNewsletter } from "@/app/newsletter/actions";

const GOLD = "#C9A96E";
const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-amber-400 focus:bg-white focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Mot de passe admin</label>
        <input name="mot_de_passe" type="password" required placeholder="••••••••" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Sujet</label>
        <input name="sujet" type="text" required placeholder="Ex. Nos nouveautés de juillet 🎉" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Contenu</label>
        <textarea name="contenu" required rows={8} placeholder="Rédigez votre newsletter ici..." className={inputClass} style={{ resize: "none" }} />
      </div>

      {result?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{result.error}</p>
      )}
      {result?.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✓ Newsletter envoyée à {result.envoyes} abonné{(result.envoyes ?? 0) > 1 ? "s" : ""} !
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-xl py-3 text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
      >
        {sending ? "Envoi en cours..." : "Envoyer la newsletter"}
      </button>
    </form>
  );
}
