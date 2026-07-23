"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C9A96E";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, #060C18 0%, #0B1120 60%, #111827 100%)" }}>
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Coach<span style={{ color: GOLD }}>Link</span>
        </Link>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Sécurité</p>
          <h2 className="text-4xl font-bold leading-tight text-white">Réinitialisez<br />votre mot de passe.</h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "#ffffff60" }}>
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>
        <p className="text-xs" style={{ color: "#ffffff30" }}>© {new Date().getFullYear()} CoachLink</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ background: "#FAF8F5" }}>
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 block text-center text-xl font-bold tracking-tight text-gray-900 lg:hidden">
            Coach<span style={{ color: GOLD }}>Link</span>
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ background: `${GOLD}22` }}>✉️</div>
              <h1 className="text-2xl font-bold text-gray-900">Email envoyé !</h1>
              <p className="mt-3 text-sm text-gray-500">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail.
              </p>
              <Link href="/connexion" className="mt-6 inline-block text-sm font-semibold hover:underline" style={{ color: GOLD }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
                <p className="mt-1 text-sm text-gray-500">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                  {loading ? "Envoi en cours…" : "Envoyer le lien"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                <Link href="/connexion" className="font-semibold hover:underline" style={{ color: GOLD }}>
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
