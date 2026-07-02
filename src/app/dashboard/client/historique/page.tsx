import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientHistoriquePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, disponibilites(heure_debut, heure_fin), coaches(id, specialite, photo_url, profiles(nom))")
    .eq("client_id", userData.user.id)
    .lt("date_souhaitee", today)
    .order("date_souhaitee", { ascending: false });

  // Grouper par coach
  const parCoach = new Map<string, {
    coachId: string;
    nom: string;
    specialite: string;
    photoUrl: string | null;
    sessions: { id: string; date: string; heureDebut: string; heureFin: string; statut: string }[];
  }>();

  for (const r of reservations ?? []) {
    const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
    if (!coachData) continue;
    const profil = Array.isArray(coachData.profiles) ? coachData.profiles[0] : coachData.profiles as { nom: string } | null;
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;

    if (!parCoach.has(coachData.id)) {
      parCoach.set(coachData.id, {
        coachId: coachData.id,
        nom: profil?.nom ?? "Coach",
        specialite: coachData.specialite ?? "",
        photoUrl: coachData.photo_url ?? null,
        sessions: [],
      });
    }

    parCoach.get(coachData.id)!.sessions.push({
      id: r.id,
      date: r.date_souhaitee,
      heureDebut: dispo?.heure_debut?.slice(0, 5) ?? "–",
      heureFin: dispo?.heure_fin?.slice(0, 5) ?? "–",
      statut: r.statut,
    });
  }

  const coachs = Array.from(parCoach.values());

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
        <Link href="/dashboard/client" className="text-sm text-blue-600 hover:underline">
          ← Tableau de bord
        </Link>
      </div>

      {coachs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucun cours passé pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {coachs.map((coach) => (
            <div key={coach.coachId} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {/* En-tête coach */}
              <div className="flex items-center gap-4 border-b border-gray-100 p-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {coach.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coach.photoUrl} alt={coach.nom} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-gray-300">👤</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{coach.nom}</p>
                  <p className="text-sm text-gray-500">{coach.specialite}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/coachs/${coach.coachId}`}
                    className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    Voir le profil
                  </Link>
                  <Link
                    href={`/dashboard/client?specialite=${encodeURIComponent(coach.specialite)}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Reprendre
                  </Link>
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-gray-50">
                {coach.sessions.map((s) => (
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

              <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
                {coach.sessions.length} session{coach.sessions.length > 1 ? "s" : ""} au total
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
