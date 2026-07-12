"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/lib/plans";

const GOLD = "#C9A96E";

const PLANS_ORDRE = ["gratuit", "starter", "pro", "elite"] as const;

export default function TarifsClient({ currentPlan, isLoggedIn }: { currentPlan: string; isLoggedIn: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubscribe(planKey: string) {
    if (!isLoggedIn) { router.push("/connexion"); return; }
    if (planKey === "gratuit") return;
    const plan = PLANS[planKey as keyof typeof PLANS];
    if (!("priceId" in plan)) return;
    setLoading(planKey);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: plan.priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  return (
    <main className="min-h-screen py-16 px-4" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>Tarifs</span>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">Choisissez votre formule</h1>
          <p className="mt-3 text-gray-500">Commencez gratuitement, évoluez selon vos besoins.</p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS_ORDRE.map((key) => {
            const plan = PLANS[key];
            const isCurrent = currentPlan === key;
            const isPopular = key === "pro";

            return (
              <div key={key} className="relative flex flex-col rounded-2xl border bg-white shadow-sm overflow-hidden transition hover:shadow-md"
                style={{ borderColor: isCurrent ? GOLD : isPopular ? "#6366f1" : "#e5e7eb" }}>

                {isPopular && (
                  <div className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: "#6366f1" }}>
                    Populaire
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>
                    Votre plan
                  </div>
                )}

                {/* Header coloré */}
                <div className="px-5 pt-8 pb-5" style={{ background: plan.gradient }}>
                  <p className="text-base font-bold" style={{ color: plan.couleurTexte }}>{plan.nom}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold" style={{ color: plan.couleurTexte }}>{plan.prix === 0 ? "Gratuit" : `${plan.prix}€`}</span>
                    {plan.prix > 0 && <span className="mb-1 text-sm opacity-70" style={{ color: plan.couleurTexte }}>/mois</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-1 flex-col px-5 py-5">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-0.5 shrink-0 text-xs" style={{ color: GOLD }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={isCurrent || key === "gratuit" || loading === key}
                    className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                    style={isCurrent || key === "gratuit"
                      ? { background: "#f3f4f6", color: "#9ca3af" }
                      : { background: plan.gradient, color: plan.couleurTexte }}
                  >
                    {loading === key ? "Chargement..." :
                     isCurrent ? "Plan actuel" :
                     key === "gratuit" ? "Gratuit" :
                     `Choisir ${plan.nom}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">Paiement sécurisé par Stripe · Résiliation à tout moment · Sans engagement</p>
      </div>
    </main>
  );
}
