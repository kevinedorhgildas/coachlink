import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";
const STATUT_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  confirmee:  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Confirmée" },
  refusee:    { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", label: "Refusée" },
  en_attente: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", label: "En attente" },
};

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
    coachId: string; nom: string; specialite: string; photoUrl: string | null;
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Historique des cours</h1>
        <p className="mt-1 text-sm text-gray-500">Retrouvez toutes vos séances passées par coach.</p>
      </div>

      {coachs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 h-0.5 w-12 rounded-full" style={{ background: `${GOLD}44` }} />
          <p className="font-medium text-gray-700">Aucun cours passé pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {coachs.map((coach) => (
            <div key={coach.coachId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Header coach */}
              <div className="flex items-center gap-4 border-b border-gray-100 p-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                  {coach.photoUrl
                    ? <img src={coach.photoUrl} alt={coach.nom} className="h-full w-full object-cover" />
                    : <span className="text-gray-400 font-bold text-xs">?</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{coach.nom}</p>
                  <p className="text-xs text-gray-400">{coach.specialite}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/coachs/${coach.coachId}`} className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                    Voir le profil →
                  </Link>
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-gray-50">
                {coach.sessions.map((s) => {
                  const badge = STATUT_STYLE[s.statut] ?? STATUT_STYLE.en_attente;
                  return (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-400">{s.heureDebut} – {s.heureFin}</p>
                      </div>
                      <span className="rounded-full border px-3 py-0.5 text-xs font-semibold" style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
                {coach.sessions.length} session{coach.sessions.length > 1 ? "s" : ""} au total
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
