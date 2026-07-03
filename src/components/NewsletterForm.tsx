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
    <div className="border-t pt-8 mt-6 text-center" style={{ borderColor: "#ffffff14" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#C9A96E" }}>Newsletter</p>
      <p className="text-sm mb-5" style={{ color: "#ffffff60" }}>Conseils exclusifs, nouveautés et offres réservées à nos membres.</p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-center gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Votre adresse email"
          className="rounded-full border px-5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold-500 bg-transparent transition"
          style={{ borderColor: "#ffffff22" }}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-navy-900 disabled:opacity-50 transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" }}
        >
          {pending ? "..." : "S'inscrire"}
        </button>
      </form>
      {result?.error && <p className="mt-3 text-xs text-red-400">{result.error}</p>}
      {result?.success && <p className="mt-3 text-xs" style={{ color: "#C9A96E" }}>✓ Inscription confirmée !</p>}
    </div>
  );
}
