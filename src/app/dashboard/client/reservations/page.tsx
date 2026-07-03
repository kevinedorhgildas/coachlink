import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cours à réserver</h1>
        <p className="mt-1 text-sm text-gray-500">Vos réservations en cours et à venir.</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucune réservation à venir.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Trouver un coach</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
            const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { jour_semaine: string; heure_debut: string; heure_fin: string } | null;
            const badge = badges[r.statut];
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                    {coachData?.photo_url ? <img src={coachData.photo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-gray-300 text-sm">👤</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/coachs/${coachData?.id}`} className="font-medium text-gray-900 hover:underline truncate">{coachProfile?.nom ?? "Coach"}</Link>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge?.bg} ${badge?.text}`}>{badge?.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{coachData?.specialite}</p>
                    <p className="text-xs text-gray-500 mt-1">📅 {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}{dispo && <span className="ml-2">· {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}</p>
                    {r.message && <p className="mt-2 text-xs italic text-gray-400">"{r.message}"</p>}
                    <div className="mt-2">
                      <Link href={`/coachs/${coachData?.id}`} className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">
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
