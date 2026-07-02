import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoachHistoriquePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, disponibilites(heure_debut, heure_fin), profiles!reservations_client_id_fkey(nom, email)")
    .eq("coach_id", userData.user.id)
    .lt("date_souhaitee", today)
    .order("date_souhaitee", { ascending: false });

  // Grouper par client
  const parClient = new Map<string, {
    email: string;
    nom: string;
    sessions: { id: string; date: string; heureDebut: string; heureFin: string; statut: string }[];
  }>();

  for (const r of reservations ?? []) {
    const profil = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string; email: string } | null;
    if (!profil) continue;
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;

    if (!parClient.has(profil.email)) {
      parClient.set(profil.email, { email: profil.email, nom: profil.nom, sessions: [] });
    }

    parClient.get(profil.email)!.sessions.push({
      id: r.id,
      date: r.date_souhaitee,
      heureDebut: dispo?.heure_debut?.slice(0, 5) ?? "–",
      heureFin: dispo?.heure_fin?.slice(0, 5) ?? "–",
      statut: r.statut,
    });
  }

  const clients = Array.from(parClient.values());

  const statutStyle: Record<string, string> = {
    confirmee: "bg-green-50 text-green-700",
    refusee: "bg-red-50 text-red-700",
    en_attente: "bg-amber-50 text-amber-700",
  };
  const statutLabel: Record<string, string> = {
    confirmee: "Confirmée",
    refusee: "Refusée",
    en_attente: "En attente",
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historique des cours</h1>
        <Link href="/dashboard/coach" className="text-sm text-blue-600 hover:underline">
          ← Tableau de bord
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucun cours passé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {clients.map((client) => (
            <div key={client.email} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {/* En-tête client */}
              <div className="flex items-center gap-4 border-b border-gray-100 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-600">
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{client.nom}</p>
                  <p className="text-sm text-gray-500">{client.sessions.length} session{client.sessions.length > 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-gray-50">
                {client.sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-gray-500">{s.heureDebut} – {s.heureFin}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statutStyle[s.statut]}`}>
                      {statutLabel[s.statut]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
