import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLANS } from "@/lib/plans";

const GOLD = "#C9A96E";

export default async function AbonnementPage({ searchParams }: { searchParams: { success?: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: coach } = await supabase
    .from("coaches")
    .select("abonnement, abonnement_fin, stripe_subscription_id")
    .eq("id", userData.user.id)
    .single();

  const plan = ((coach as Record<string, unknown>)?.abonnement as string) ?? "gratuit";
  const planData = PLANS[plan as keyof typeof PLANS];
  const fin = (coach as Record<string, unknown>)?.abonnement_fin as string | null;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon abonnement</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez votre formule CoachLink.</p>
      </div>

      {searchParams.success && (
        <div className="mb-6 rounded-2xl border p-4 text-sm font-medium" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
          ✓ Abonnement activé avec succès ! Bienvenue sur la formule {planData.nom}.
        </div>
      )}

      {/* Plan actuel */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm mb-6" style={{ borderColor: `${GOLD}44` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Plan actuel</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{planData.nom}</p>
          </div>
          <div className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: planData.gradient, color: planData.couleurTexte }}>
            {planData.prix === 0 ? "Gratuit" : `${planData.prix}€/mois`}
          </div>
        </div>

        {fin && (
          <p className="text-xs text-gray-400">
            Renouvellement le {new Date(fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        <ul className="mt-4 space-y-2">
          {planData.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <span style={{ color: GOLD }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {plan === "gratuit" ? (
          <Link href="/tarifs" className="rounded-xl py-3 text-center text-sm font-semibold transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Passer à une formule payante
          </Link>
        ) : (
          <>
            <Link href="/tarifs" className="rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Changer de formule
            </Link>
            <p className="text-center text-xs text-gray-400">
              Pour résilier votre abonnement, contactez-nous à <a href="mailto:contact@coachlink.fr" className="underline">contact@coachlink.fr</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
