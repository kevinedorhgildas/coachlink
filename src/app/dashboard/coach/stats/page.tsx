import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PERIODES = [
  { key: "1m", label: "1 mois", mois: 1 },
  { key: "3m", label: "3 mois", mois: 3 },
  { key: "6m", label: "6 mois", mois: 6 },
  { key: "1an", label: "1 an", mois: 12 },
  { key: "3ans", label: "3 ans", mois: 36 },
  { key: "5ans", label: "5 ans", mois: 60 },
  { key: "10ans", label: "10 ans", mois: 120 },
];

export default async function StatsCoachPage({
  searchParams,
}: {
  searchParams: { periode?: string };
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const periodeKey = searchParams.periode ?? "6m";
  const periode = PERIODES.find((p) => p.key === periodeKey) ?? PERIODES[0];

  const today = new Date().toISOString().split("T")[0];
  const maintenant = new Date();
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - (periode.mois - 1), 1);
  const debutStr = debut.toISOString().split("T")[0];

  const [
    { count: totalRealises },
    { count: totalConfirmes },
    { count: totalEnAttente },
    { data: toutes },
    { data: dansPeriode },
    { data: coach },
  ] = await Promise.all([
    supabase.from("reservations").select("id", { count: "exact", head: true })
      .eq("coach_id", userData.user.id).eq("statut", "confirmee").lt("date_souhaitee", today),
    supabase.from("reservations").select("id", { count: "exact", head: true })
      .eq("coach_id", userData.user.id).eq("statut", "confirmee"),
    supabase.from("reservations").select("id", { count: "exact", head: true })
      .eq("coach_id", userData.user.id).eq("statut", "en_attente"),
    supabase.from("reservations").select("date_souhaitee")
      .eq("coach_id", userData.user.id).eq("statut", "confirmee").lt("date_souhaitee", today),
    supabase.from("reservations").select("date_souhaitee")
      .eq("coach_id", userData.user.id).eq("statut", "confirmee")
      .gte("date_souhaitee", debutStr).lt("date_souhaitee", today),
    supabase.from("coaches").select("tarif_horaire").eq("id", userData.user.id).single(),
  ]);

  const tarif = coach?.tarif_horaire ?? 0;
  const revenuTotal = (totalRealises ?? 0) * tarif;
  const revenuPeriode = (dansPeriode?.length ?? 0) * tarif;

  // Construire les colonnes du graphe
  // Pour ≤12 mois → colonnes mensuelles
  // Pour >12 mois → colonnes annuelles
  const parAnnee = periode.mois > 12;

  type Colonne = { key: string; label: string };
  let colonnes: Colonne[] = [];

  if (!parAnnee) {
    colonnes = Array.from({ length: periode.mois }, (_, i) => {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - (periode.mois - 1 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("fr-FR", { month: "short", year: periode.mois > 6 ? "2-digit" : undefined }),
      };
    });
  } else {
    const nbAnnees = Math.ceil(periode.mois / 12);
    colonnes = Array.from({ length: nbAnnees }, (_, i) => {
      const annee = maintenant.getFullYear() - (nbAnnees - 1 - i);
      return { key: String(annee), label: String(annee) };
    });
  }

  // Agréger les données
  const dataMap: Record<string, number> = {};
  for (const r of dansPeriode ?? []) {
    const key = parAnnee ? r.date_souhaitee.slice(0, 4) : r.date_souhaitee.slice(0, 7);
    dataMap[key] = (dataMap[key] ?? 0) + 1;
  }

  const valeurs = colonnes.map((c) => dataMap[c.key] ?? 0);
  const maxVal = Math.max(...valeurs, 1);

  // Meilleur mois/année
  const meilleurIdx = valeurs.indexOf(Math.max(...valeurs));
  const meilleur = valeurs[meilleurIdx] > 0 ? colonnes[meilleurIdx]?.label : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cours réalisés</h1>
        <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de votre activité de coaching.</p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Cours réalisés", value: totalRealises ?? 0, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Cours confirmés", value: totalConfirmes ?? 0, color: "text-green-600", bg: "bg-green-50" },
          { label: "En attente", value: totalEnAttente ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Revenu estimé", value: `${revenuTotal} €`, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border border-gray-200 ${bg} p-4 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Graphe */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Titre + sélecteur de période */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Cours réalisés</h2>
            <p className="text-xs text-gray-400">
              {dansPeriode?.length ?? 0} cours · {revenuPeriode} € sur {periode.label}
              {meilleur && <span> · 🏆 Meilleur : {meilleur}</span>}
            </p>
          </div>
          {/* Boutons période */}
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {PERIODES.map((p) => (
              <Link
                key={p.key}
                href={`/dashboard/coach/stats?periode=${p.key}`}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  periodeKey === p.key
                    ? "bg-teal-600 text-white shadow"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Barres */}
        <div className="flex h-36 items-end gap-1.5 overflow-x-auto pb-1">
          {colonnes.map((col, i) => {
            const val = valeurs[i];
            const pct = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 6 : 0) : 0;
            const isTop = val > 0 && val === Math.max(...valeurs);
            return (
              <div key={col.key} className="flex min-w-[28px] flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-gray-500">{val > 0 ? val : ""}</span>
                <div
                  className={`w-full rounded-t-md transition-all ${isTop ? "bg-teal-400" : "bg-teal-600"}`}
                  style={{ height: `${pct}%`, minHeight: val > 0 ? "4px" : "0" }}
                />
                <span className="text-[9px] leading-tight text-gray-400 text-center">{col.label}</span>
              </div>
            );
          })}
        </div>

        {(dansPeriode?.length ?? 0) === 0 && (
          <p className="mt-3 text-center text-sm text-gray-400">Aucun cours réalisé sur cette période.</p>
        )}
      </div>
    </div>
  );
}
