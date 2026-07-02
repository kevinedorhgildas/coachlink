import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VentesCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const [{ data: reservations }, { data: coach }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, date_souhaitee, disponibilites(heure_debut, heure_fin), profiles!reservations_client_id_fkey(nom)")
      .eq("coach_id", userData.user.id)
      .eq("statut", "confirmee")
      .lt("date_souhaitee", today)
      .order("date_souhaitee", { ascending: false }),
    supabase.from("coaches").select("tarif_horaire").eq("id", userData.user.id).single(),
  ]);

  const tarif = coach?.tarif_horaire ?? 0;
  const total = (reservations?.length ?? 0) * tarif;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cours vendus</h1>
          <p className="mt-1 text-sm text-gray-500">Séances confirmées et effectuées.</p>
        </div>
        {reservations && reservations.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-right shadow-sm">
            <p className="text-xs text-gray-400">Revenu total estimé</p>
            <p className="text-xl font-bold text-teal-600">{total} €</p>
            <p className="text-xs text-gray-400">{reservations.length} séance{reservations.length > 1 ? "s" : ""} × {tarif} €</p>
          </div>
        )}
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucun cours vendu pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Horaire</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map((r) => {
                const client = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string } | null;
                const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{client?.nom ?? "–"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {dispo ? `${dispo.heure_debut.slice(0, 5)} – ${dispo.heure_fin.slice(0, 5)}` : "–"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{tarif} €</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</td>
                <td className="px-4 py-3 text-right font-bold text-teal-600">{total} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
