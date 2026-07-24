import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const GOLD = "#C9A96E";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: nbCoachs },
    { count: nbClients },
    { count: nbReservationsTotal },
    { count: nbReservationsMois },
    { count: nbEnAttente },
    { count: nbCoachsEnAttente },
    { data: coaches },
  ] = await Promise.all([
    supabase.from("coaches").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("statut", "confirmee").lt("date_souhaitee", today),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("statut", "confirmee").gte("date_souhaitee", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]).lt("date_souhaitee", today),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("statut", "en_attente"),
    supabase.from("coaches").select("id", { count: "exact", head: true }).eq("statut", "en_attente"),
    supabase.from("coaches").select("id, tarif_horaire, statut, profiles(nom), created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const KPIS = [
    { label: "Coachs actifs",       value: nbCoachs ?? 0,            color: GOLD },
    { label: "Clients inscrits",     value: nbClients ?? 0,           color: "#6366f1" },
    { label: "Séances réalisées",    value: nbReservationsTotal ?? 0, color: "#16a34a" },
    { label: "Séances ce mois",      value: nbReservationsMois ?? 0,  color: "#0891b2" },
    { label: "Réservations en att.", value: nbEnAttente ?? 0,         color: "#d97706" },
    { label: "Coachs en validation", value: nbCoachsEnAttente ?? 0,   color: "#dc2626" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">Vue globale de la plateforme CoachLink.</p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {KPIS.map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {label.includes("en att") || label.includes("validation") ? (
                <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: color }}>{value}</span>
              ) : null}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-xs font-medium text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Derniers coachs inscrits */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Derniers coachs inscrits</h2>
          <Link href="/admin/coachs" className="text-xs font-semibold transition hover:opacity-70" style={{ color: GOLD }}>Voir tous →</Link>
        </div>
        {!coaches || coaches.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun coach.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {coaches.map((c) => {
              const profileData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles as { nom: string } | null;
              const statut = (c as Record<string, unknown>).statut as string ?? "actif";
              const statutStyle: Record<string, { bg: string; color: string }> = {
                actif:       { bg: "#f0fdf4", color: "#166534" },
                en_attente:  { bg: "#fffbeb", color: "#92400e" },
                suspendu:    { bg: "#fef2f2", color: "#991b1b" },
              };
              const s = statutStyle[statut] ?? statutStyle.actif;
              return (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{profileData?.nom ?? "—"}</p>
                    <p className="text-xs text-gray-400">{c.tarif_horaire ? `${c.tarif_horaire} €/h` : "Tarif non défini"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{statut}</span>
                    <Link href={`/admin/coachs`} className="text-xs text-gray-400 hover:text-gray-600">→</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
