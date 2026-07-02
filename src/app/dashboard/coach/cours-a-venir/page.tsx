import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
        <p className="mt-1 text-sm text-gray-500">Vos prochaines séances planifiées.</p>
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucun cours à venir pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string } | null;
            const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                      {clientProfile?.nom?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{clientProfile?.nom ?? "Client"}</p>
                      <p className="text-sm text-gray-500">
                        📅 {new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {dispo && <span className="ml-2">🕐 {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium ${statutStyle[r.statut]}`}>
                    {statutLabel[r.statut]}
                  </span>
                </div>
                {r.message && (
                  <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm italic text-gray-600">"{r.message}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
