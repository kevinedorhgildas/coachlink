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

  const statutStyle: Record<string, string> = {
    confirmee: "bg-green-50 text-green-700 border-green-200",
    refusee: "bg-red-50 text-red-700 border-red-200",
    en_attente: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const statutLabel: Record<string, string> = {
    confirmee: "Confirmé",
    refusee: "Refusé",
    en_attente: "En attente",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cours à venir</h1>
        <p className="mt-1 text-sm text-gray-500">Vos réservations en cours et à venir.</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucune réservation à venir.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
            const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { jour_semaine: string; heure_debut: string; heure_fin: string } | null;

            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {coachData?.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coachData.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">👤</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link href={`/coachs/${coachData?.id}`} className="font-semibold text-gray-900 hover:underline">
                        {coachProfile?.nom ?? "Coach"}
                      </Link>
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${statutStyle[r.statut]}`}>
                        {statutLabel[r.statut]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{coachData?.specialite}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                      {dispo && (
                        <span className="capitalize">🕐 {dispo.jour_semaine} {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>
                      )}
                    </div>
                    {r.message && (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 italic">"{r.message}"</p>
                    )}
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
