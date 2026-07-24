"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, FEATURES } from "@/lib/plans";

const GOLD = "#C9A96E";
const PLANS_ORDRE = ["gratuit", "starter", "pro", "elite"] as const;

const planColors: Record<string, string> = {
  gratuit: "#6b7280",
  starter: "#C9A96E",
  pro: "#6366f1",
  elite: "#0B1120",
};

export default function TarifsClient({ currentPlan, isLoggedIn }: { currentPlan: string; isLoggedIn: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubscribe(planKey: string) {
    if (!isLoggedIn) { router.push("/connexion"); return; }
    if (planKey === "gratuit") return;
    setLoading(planKey);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  return (
    <main className="min-h-screen py-16 px-4" style={{ background: "#FAF8F5" }}>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-14 text-center">
          <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>Tarifs</span>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">Choisissez votre formule</h1>
          <p className="mt-3 text-gray-500">Commencez gratuitement, évoluez selon vos besoins.</p>
        </div>

        {/* Cards prix */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          {PLANS_ORDRE.map((key) => {
            const plan = PLANS[key];
            const isCurrent = currentPlan === key;
            const isPopular = key === "pro";

            return (
              <div key={key} className="relative flex flex-col rounded-2xl border bg-white shadow-sm overflow-hidden"
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

                <div className="px-5 pt-8 pb-5" style={{ background: plan.gradient }}>
                  <p className="text-base font-bold" style={{ color: plan.couleurTexte }}>{plan.nom}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold" style={{ color: plan.couleurTexte }}>
                      {plan.prix === 0 ? "Gratuit" : `${plan.prix}€`}
                    </span>
                    {plan.prix > 0 && <span className="mb-1 text-sm opacity-70" style={{ color: plan.couleurTexte }}>/mois</span>}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed opacity-80" style={{ color: plan.couleurTexte }}>
                    {plan.description}
                  </p>
                </div>

                <div className="px-5 py-5">
                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={isCurrent || key === "gratuit" || loading === key}
                    className="w-full rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
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

        {/* Tableau comparatif */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 w-1/2">Fonctionnalité</th>
                  {PLANS_ORDRE.map((key) => (
                    <th key={key} className="px-4 py-4 text-center font-bold" style={{ color: planColors[key] }}>
                      {PLANS[key].nom}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr key={feature.label} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="px-6 py-3 text-gray-700">{feature.label}</td>
                    {PLANS_ORDRE.map((key) => (
                      <td key={key} className="px-4 py-3 text-center">
                        {feature[key] ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: planColors[key] }}>
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-gray-300 bg-gray-100">
                            ✕
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">Paiement sécurisé par Stripe · Résiliation à tout moment · Sans engagement</p>
      </div>
    </main>
  );
}
