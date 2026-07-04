import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  confirmee:  { bg: "#f0fdf4", color: "#166534", label: "Confirmé" },
  refusee:    { bg: "#fef2f2", color: "#991b1b", label: "Refusé" },
  en_attente: { bg: "#fffbeb", color: "#92400e", label: "En attente" },
};

export default async function CoursAVenirPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, message, disponibilites(heure_debut, heure_fin), profiles!reservations_client_id_fkey(nom)")
    .eq("coach_id", userData.user.id)
    .gte("date_souhaitee", today)
    .order("date_souhaitee", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cours à venir</h1>
        <p className="mt-1 text-sm text-gray-500">Vos prochaines séances planifiées.</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: `${GOLD}22` }}>📅</div>
          <p className="font-medium text-gray-700">Aucun cours à venir pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string } | null;
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
            const badge = BADGE[r.statut] ?? BADGE.en_attente;
            const initiale = clientProfile?.nom?.charAt(0).toUpperCase() ?? "?";
            return (
              <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                      {initiale}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{clientProfile?.nom ?? "Client"}</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        📅 {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {dispo && <span className="ml-2">· {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold" style={{ background: badge.bg, color: badge.color, borderColor: badge.color + "33" }}>
                    {badge.label}
                  </span>
                </div>
                {r.message && (
                  <p className="mt-3 rounded-xl px-3 py-2 text-sm italic text-gray-500" style={{ background: `${GOLD}08` }}>"{r.message}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
