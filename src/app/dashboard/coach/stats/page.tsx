import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const PERIODES = [
  { key: "1m",   label: "1 mois",  mois: 1 },
  { key: "3m",   label: "3 mois",  mois: 3 },
  { key: "6m",   label: "6 mois",  mois: 6 },
  { key: "1an",  label: "1 an",    mois: 12 },
  { key: "3ans", label: "3 ans",   mois: 36 },
  { key: "5ans", label: "5 ans",   mois: 60 },
  { key: "10ans",label: "10 ans",  mois: 120 },
];

export default async function StatsCoachPage({ searchParams }: { searchParams: { periode?: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const periodeKey = searchParams.periode ?? "6m";
  const periode = PERIODES.find((p) => p.key === periodeKey) ?? PERIODES[2];

  const today = new Date().toISOString().split("T")[0];
  const maintenant = new Date();
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - (periode.mois - 1), 1);
  const debutStr = debut.toISOString().split("T")[0];

  const [
    { count: totalRealises },
    { count: totalConfirmes },
    { count: totalEnAttente },
    { data: dansPeriode },
    { data: coach },
  ] = await Promise.all([
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("coach_id", userData.user.id).eq("statut", "confirmee").lt("date_souhaitee", today),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("coach_id", userData.user.id).eq("statut", "confirmee"),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("coach_id", userData.user.id).eq("statut", "en_attente"),
    supabase.from("reservations").select("date_souhaitee").eq("coach_id", userData.user.id).eq("statut", "confirmee").gte("date_souhaitee", debutStr).lt("date_souhaitee", today),
    supabase.from("coaches").select("tarif_horaire").eq("id", userData.user.id).single(),
  ]);

  const tarif = coach?.tarif_horaire ?? 0;
  const revenuTotal = (totalRealises ?? 0) * tarif;
  const revenuPeriode = (dansPeriode?.length ?? 0) * tarif;

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

  const dataMap: Record<string, number> = {};
  for (const r of dansPeriode ?? []) {
    const key = parAnnee ? r.date_souhaitee.slice(0, 4) : r.date_souhaitee.slice(0, 7);
    dataMap[key] = (dataMap[key] ?? 0) + 1;
  }

  const valeurs = colonnes.map((c) => dataMap[c.key] ?? 0);
  const maxVal = Math.max(...valeurs, 1);
  const meilleurIdx = valeurs.indexOf(Math.max(...valeurs));
  const meilleur = valeurs[meilleurIdx] > 0 ? colonnes[meilleurIdx]?.label : null;

  const KPIS = [
    { label: "Cours réalisés",  value: totalRealises ?? 0,   icon: "✅" },
    { label: "Cours confirmés", value: totalConfirmes ?? 0,  icon: "📌" },
    { label: "En attente",      value: totalEnAttente ?? 0,  icon: "⏳" },
    { label: "Revenu estimé",   value: `${revenuTotal} €`,   icon: "💰" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cours réalisés</h1>
        <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de votre activité de coaching.</p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPIS.map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border p-4 text-center shadow-sm" style={{ borderColor: `${GOLD}44`, background: `${GOLD}0a` }}>
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-lg" style={{ background: `${GOLD}22` }}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-xs font-medium" style={{ color: "#9A7A2E" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Graphe */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Activité sur {periode.label}</h2>
            <p className="text-xs text-gray-400">
              {dansPeriode?.length ?? 0} cours · {revenuPeriode} €
              {meilleur && <span style={{ color: GOLD }}> · 🏆 Meilleur : {meilleur}</span>}
            </p>
          </div>
          {/* Sélecteur de période */}
          <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {PERIODES.map((p) => (
              <Link
                key={p.key}
                href={`/dashboard/coach/stats?periode=${p.key}`}
                className="rounded-lg px-3 py-1 text-xs font-semibold transition"
                style={periodeKey === p.key
                  ? { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }
                  : { color: "#6b7280" }}
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
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${pct}%`,
                    minHeight: val > 0 ? "4px" : "0",
                    background: isTop
                      ? `linear-gradient(135deg, ${GOLD}, #E8D5A3)`
                      : `${GOLD}66`,
                  }}
                />
                <span className="text-[9px] leading-tight text-center text-gray-400">{col.label}</span>
              </div>
            );
          })}
        </div>

        {(dansPeriode?.length ?? 0) === 0 && (
          <p className="mt-4 text-center text-sm text-gray-400">Aucun cours réalisé sur cette période.</p>
        )}
      </div>
    </div>
  );
}
