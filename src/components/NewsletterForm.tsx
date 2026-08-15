"use client";

import { useState } from "react";
import Link from "next/link";
import { sInscrireNewsletter } from "@/app/newsletter/actions";

/**
 * La mention d'information, à afficher au moment où l'adresse est saisie.
 *
 * L'article 13 veut que l'information soit donnée *lors* de la collecte, pas
 * seulement quelque part sur le site : une politique de confidentialité
 * atteignable depuis le pied de page ne couvre pas un champ qui, lui, est
 * partout. Le texte tient donc en une phrase — finalité, base légale, retrait —
 * et le détail reste dans la politique, vers laquelle il renvoie.
 */
function Mention({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed ${className}`} style={{ color: "#ffffff55" }}>
      En vous inscrivant, vous consentez à recevoir nos actualités par email. Vous
      pouvez vous désabonner à tout moment depuis le lien présent dans chaque
      message.{" "}
      <Link href="/confidentialite" className="underline hover:opacity-80">
        Politique de confidentialité
      </Link>
      .
    </p>
  );
}

/**
 * Le même message quel que soit le sort de l'adresse : inscrite à l'instant,
 * réactivée, ou déjà présente. Distinguer ces cas reviendrait à révéler qui
 * figure dans la liste — voir `sInscrireNewsletter`.
 */
const CONFIRMATION =
  "✓ C'est noté. Si cette adresse n'était pas déjà inscrite, vous allez recevoir un message de bienvenue.";

export default function NewsletterForm({ compact }: { compact?: boolean } = {}) {
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

  if (compact) {
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="Votre email"
            className="w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition"
            style={{ borderColor: "#ffffff22" }}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120" }}
          >
            {pending ? "..." : "S'inscrire"}
          </button>
        </form>
        <Mention className="mt-2.5" />
        {result?.error && <p className="mt-2 text-xs text-red-400">{result.error}</p>}
        {result?.success && (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "#C9A96E" }}>{CONFIRMATION}</p>
        )}
      </div>
    );
  }

  return (
    <div className="border-t pt-8 mt-6 text-center" style={{ borderColor: "#ffffff14" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C9A96E" }}>Newsletter</p>
      <p className="text-sm mb-5" style={{ color: "#ffffff60" }}>Conseils exclusifs, nouveautés et offres réservées à nos membres.</p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-center gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Votre adresse email"
          className="rounded-full border px-5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none bg-transparent transition"
          style={{ borderColor: "#ffffff22" }}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-50 transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120" }}
        >
          {pending ? "..." : "S'inscrire"}
        </button>
      </form>
      <Mention className="mx-auto mt-4 max-w-md" />
      {result?.error && <p className="mt-3 text-xs text-red-400">{result.error}</p>}
      {result?.success && (
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed" style={{ color: "#C9A96E" }}>
          {CONFIRMATION}
        </p>
      )}
    </div>
  );
}
