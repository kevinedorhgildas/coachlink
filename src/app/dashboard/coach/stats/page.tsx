import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StatsCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalRealises },
    { count: totalConfirmes },
    { count: totalEnAttente },
    { data: parMois },
    { data: coach },
  ] = await Promise.all([
    supabase.from("reservations").select("id", { count: "exact", head: true })
      .eq("coach_id", userData.user.id).eq("statut", "confirmee").lt("date_souhaitee", today),
    supabase.from("reservations").select("id", { count: "exact", head: true })
      .eq("coach_id", userData.user.id).eq("statut", "confirmee"),
    supabase.from("reservations").select("id", { count: "exact", head: true })
      .eq("coach_id", userData.user.id).eq("statut", "en_attente"),
    supabase.from("reservations").select("date_souhaitee, statut")
      .eq("coach_id", userData.user.id).eq("statut", "confirmee").lt("date_souhaitee", today),
    supabase.from("coaches").select("tarif_horaire").eq("id", userData.user.id).single(),
  ]);

  const revenuTotal = (totalRealises ?? 0) * (coach?.tarif_horaire ?? 0);

  // Regrouper par mois (6 derniers mois)
  const maintenant = new Date();
  const moisLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
    };
  });

  const parMoisMap: Record<string, number> = {};
  for (const r of parMois ?? []) {
    const key = r.date_souhaitee.slice(0, 7);
    parMoisMap[key] = (parMoisMap[key] ?? 0) + 1;
  }

  const maxVal = Math.max(...moisLabels.map((m) => parMoisMap[m.key] ?? 0), 1);

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

      {/* Graphe barres 6 derniers mois */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Cours réalisés — 6 derniers mois</h2>
        <div className="flex h-32 items-end gap-3">
          {moisLabels.map((m) => {
            const val = parMoisMap[m.key] ?? 0;
            const height = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 8 : 0) : 0;
            return (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{val > 0 ? val : ""}</span>
                <div className="w-full rounded-t-md bg-teal-500 transition-all" style={{ height: `${height}%`, minHeight: val > 0 ? "4px" : "0" }} />
                <span className="text-[10px] text-gray-400">{m.label}</span>
              </div>
            );
          })}
        </div>
        {(totalRealises ?? 0) === 0 && (
          <p className="mt-4 text-center text-sm text-gray-400">Aucun cours réalisé sur cette période.</p>
        )}
      </div>
    </div>
  );
}
