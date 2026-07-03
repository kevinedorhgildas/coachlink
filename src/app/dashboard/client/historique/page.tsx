import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const cardStyle = { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" };

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
      parCoach.set(coachData.id, { coachId: coachData.id, nom: profil?.nom ?? "Coach", specialite: coachData.specialite ?? "", photoUrl: coachData.photo_url ?? null, sessions: [] });
    }
    parCoach.get(coachData.id)!.sessions.push({ id: r.id, date: r.date_souhaitee, heureDebut: dispo?.heure_debut?.slice(0, 5) ?? "–", heureFin: dispo?.heure_fin?.slice(0, 5) ?? "–", statut: r.statut });
  }

  const coachs = Array.from(parCoach.values());

  const badges: Record<string, { bg: string; text: string; label: string }> = {
    confirmee: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmée" },
    refusee: { bg: "bg-red-50", text: "text-red-700", label: "Refusée" },
    en_attente: { bg: "bg-amber-50", text: "text-amber-700", label: "En attente" },
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Historique des cours</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Retrouvez toutes vos séances passées par coach.</p>
      </div>

      {coachs.length === 0 ? (
        <div className="rounded-2xl p-10 text-center shadow-sm" style={cardStyle}>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: "linear-gradient(135deg, #667eea22, #764ba222)" }}>📋</div>
          <p className="text-gray-600 font-medium">Aucun cours passé pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {coachs.map((coach) => (
            <div key={coach.coachId} className="rounded-2xl overflow-hidden shadow-sm" style={cardStyle}>
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl">
                  {coach.photoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={coach.photoUrl} alt={coach.nom} className="h-full w-full object-cover" />
                    : "👤"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{coach.nom}</p>
                  <p className="text-sm text-gray-500">{coach.specialite}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/coachs/${coach.coachId}`} className="rounded-xl border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
                    Profil
                  </Link>
                  <Link href={`/dashboard/client?specialite=${encodeURIComponent(coach.specialite)}`} className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Reprendre
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {coach.sessions.map((s) => {
                  const badge = badges[s.statut];
                  return (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-800 capitalize">
                          {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-500">{s.heureDebut} – {s.heureFin}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge?.bg} ${badge?.text}`}>{badge?.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-50">
                <p className="text-xs text-gray-400">{coach.sessions.length} session{coach.sessions.length > 1 ? "s" : ""} au total</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
