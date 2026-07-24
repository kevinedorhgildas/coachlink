import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";
const STATUT_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  confirmee:  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Confirmée" },
  refusee:    { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", label: "Refusée" },
  en_attente: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", label: "En attente" },
};

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

  const parClient = new Map<string, {
    email: string; nom: string;
    sessions: { id: string; date: string; heureDebut: string; heureFin: string; statut: string }[];
  }>();

  for (const r of reservations ?? []) {
    const profil = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string; email: string } | null;
    if (!profil) continue;
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
    if (!parClient.has(profil.email)) {
      parClient.set(profil.email, { email: profil.email, nom: profil.nom, sessions: [] });
    }
    parClient.get(profil.email)!.sessions.push({ id: r.id, date: r.date_souhaitee, heureDebut: dispo?.heure_debut?.slice(0, 5) ?? "–", heureFin: dispo?.heure_fin?.slice(0, 5) ?? "–", statut: r.statut });
  }

  const clients = Array.from(parClient.values());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Historique des cours</h1>
        <p className="mt-1 text-sm text-gray-500">Toutes vos séances passées par client.</p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 h-0.5 w-12 rounded-full" style={{ background: `${GOLD}44` }} />
          <p className="font-medium text-gray-700">Aucun cours passé pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.email} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Header client */}
              <div className="flex items-center gap-4 border-b border-gray-100 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{client.nom}</p>
                  <p className="text-xs text-gray-400">{client.sessions.length} session{client.sessions.length > 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-gray-50">
                {client.sessions.map((s) => {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
