import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AchatsClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  // Réservations confirmées passées = cours achetés
  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, coaches(id, specialite, tarif_horaire, photo_url, profiles(nom)), disponibilites(heure_debut, heure_fin)")
    .eq("client_id", userData.user.id)
    .eq("statut", "confirmee")
    .lt("date_souhaitee", today)
    .order("date_souhaitee", { ascending: false });

  const total = reservations?.reduce((sum, r) => {
    const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { tarif_horaire: number } | null;
    return sum + (coachData?.tarif_horaire ?? 0);
  }, 0) ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Historique d'achats</h1>
          <p className="mt-1 text-sm text-gray-500">Vos séances confirmées et effectuées.</p>
        </div>
        {reservations && reservations.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-right">
            <p className="text-xs text-gray-400">Total dépensé</p>
            <p className="text-lg font-bold text-gray-900">{total} €</p>
          </div>
        )}
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucun achat de cours pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Coach</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Horaire</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Tarif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map((r) => {
                const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; tarif_horaire: number; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
                const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
                const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/coachs/${coachData?.id}`} className="font-medium text-gray-900 hover:underline">
                        {coachProfile?.nom ?? "Coach"}
                      </Link>
                      <p className="text-xs text-gray-400">{coachData?.specialite}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {dispo ? `${dispo.heure_debut.slice(0, 5)} – ${dispo.heure_fin.slice(0, 5)}` : "–"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {coachData?.tarif_horaire ?? "–"} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{total} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
