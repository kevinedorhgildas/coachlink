import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const cardStyle = { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" };

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

  const badges: Record<string, { bg: string; text: string; label: string }> = {
    confirmee: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmé" },
    refusee: { bg: "bg-red-50", text: "text-red-700", label: "Refusé" },
    en_attente: { bg: "bg-amber-50", text: "text-amber-700", label: "En attente" },
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cours à réserver</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Vos réservations en cours et à venir.</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-2xl p-10 text-center shadow-sm" style={cardStyle}>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: "linear-gradient(135deg, #667eea22, #764ba222)" }}>📌</div>
          <p className="text-gray-600 font-medium">Aucune réservation à venir</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
            const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { jour_semaine: string; heure_debut: string; heure_fin: string } | null;
            const badge = badges[r.statut];

            return (
              <div key={r.id} className="rounded-2xl p-4 shadow-sm" style={cardStyle}>
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-lg">
                    {coachData?.photo_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={coachData.photo_url} alt="" className="h-full w-full object-cover" />
                      : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/coachs/${coachData?.id}`} className="font-semibold text-gray-900 hover:underline truncate">
                        {coachProfile?.nom ?? "Coach"}
                      </Link>
                      <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-medium ${badge?.bg} ${badge?.text}`}>{badge?.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{coachData?.specialite}</p>
                    <p className="mt-1.5 text-xs text-gray-600">
                      📅 {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      {dispo && <span className="ml-2">· {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}
                    </p>
                    {r.message && <p className="mt-2 text-xs italic text-gray-400">"{r.message}"</p>}
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
