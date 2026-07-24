"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C9A96E";

export default function ReinitialiserMotDePassePage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Si le hash contient type=recovery, le token est déjà là
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
      return;
    }

    // Vérifie si une session active existe déjà
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "#FAF8F5" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-xl font-bold tracking-tight text-gray-900">
          Coach<span style={{ color: GOLD }}>Link</span>
        </Link>

        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold" style={{ background: `${GOLD}22`, color: GOLD }}>✓</div>
            <h1 className="text-2xl font-bold text-gray-900">Mot de passe mis à jour !</h1>
            <p className="mt-3 text-sm text-gray-500">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <Link href="/connexion" className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              Se connecter
            </Link>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full animate-pulse" style={{ background: `${GOLD}22` }}><span className="h-3 w-3 rounded-full" style={{ background: GOLD }} /></div>
            <h1 className="text-xl font-bold text-gray-900">Vérification en cours…</h1>
            <p className="mt-2 text-sm text-gray-500">Veuillez patienter quelques secondes.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
              <p className="mt-1 text-sm text-gray-500">Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? "Cacher" : "Voir"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                {loading ? "Mise à jour…" : "Enregistrer le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
