import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  confirmee: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Confirmé" },
  refusee:   { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", label: "Refusé" },
  en_attente:{ bg: "#fffbeb", text: "#92400e", border: "#fde68a", label: "En attente" },
};

export default async function ReservationsClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, message, coaches(id, specialite, photo_url, profiles(nom)), disponibilites(jour_semaine, heure_debut, heure_fin)")
    .eq("client_id", userData.user.id)
    .gte("date_souhaitee", today)
    .order("date_souhaitee", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cours à réserver</h1>
        <p className="mt-1 text-sm text-gray-500">Vos réservations en cours et à venir.</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: `${GOLD}22` }}>📌</div>
          <p className="font-medium text-gray-700">Aucune réservation à venir.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
            const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { jour_semaine: string; heure_debut: string; heure_fin: string } | null;
            const badge = BADGES[r.statut] ?? BADGES.en_attente;

            return (
              <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                    {coachData?.photo_url
                      ? <img src={coachData.photo_url} alt="" className="h-full w-full object-cover" />
                      : <span className="text-gray-300 text-lg">👤</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{coachProfile?.nom ?? "Coach"}</p>
                      <span className="rounded-full border px-3 py-0.5 text-xs font-semibold" style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{coachData?.specialite}</p>
                    <p className="mt-1.5 text-sm text-gray-600">
                      📅 {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      {dispo && <span className="ml-2 text-gray-400">· {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}
                    </p>
                    {r.message && <p className="mt-1.5 text-xs italic text-gray-400">"{r.message}"</p>}
                    <div className="mt-3">
                      <Link href={`/coachs/${coachData?.id}`} className="rounded-full border px-4 py-1.5 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                        Voir le profil →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
