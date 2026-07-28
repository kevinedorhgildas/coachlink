import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const RESA_STYLE = {
  confirmee: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", label: "Confirmée" },
  refusee:   { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", label: "Refusée" },
  en_attente:{ bg: "#fffbeb", border: "#fde68a", text: "#92400e", label: "En attente" },
};

export default async function CoachNotificationsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: reservations }, { data: notifsRaw }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, date_souhaitee, statut, created_at, message, profiles!reservations_client_id_fkey(id, nom)")
      .eq("coach_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("notifications_coach")
      .select("id, type, message, lu, meta, created_at")
      .eq("coach_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Fusionne et trie par date décroissante
  const notifs = [
    ...(reservations ?? []).map((r) => {
      const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { id: string; nom: string } | null;
      const nomClient = clientProfile?.nom ?? "Un client";
      const date = new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      const style = RESA_STYLE[r.statut as keyof typeof RESA_STYLE] ?? RESA_STYLE.en_attente;
      const msg = r.statut === "confirmee"
        ? `Vous avez confirmé la réservation de ${nomClient} pour le ${date}.`
        : r.statut === "refusee"
        ? `Vous avez refusé la demande de ${nomClient} pour le ${date}.`
        : `${nomClient} a demandé une réservation pour le ${date}.`;
      return { id: r.id, kind: "reservation" as const, msg, style, created_at: r.created_at, statut: r.statut, messageTexte: r.message };
    }),
    ...(notifsRaw ?? []).map((n) => ({
      id: n.id,
      kind: "notif" as const,
      msg: n.message,
      type: n.type,
      lu: n.lu,
      meta: n.meta as { client_id?: string } | null,
      style: { bg: `${GOLD}0d`, border: `${GOLD}44`, text: "#5a3e00" },
      created_at: n.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const nbEnAttente = (reservations ?? []).filter((r) => r.statut === "en_attente").length;
  const nbNonLues = (notifsRaw ?? []).filter((n) => !n.lu).length;
  const totalBadge = nbEnAttente + nbNonLues;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Réservations, abonnements et mises à jour.</p>
        </div>
        {totalBadge > 0 && (
          <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            {totalBadge} nouvelle{totalBadge > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 h-0.5 w-12 rounded-full" style={{ background: `${GOLD}44` }} />
          <p className="font-medium text-gray-700">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => (
            <div key={n.id} className="rounded-2xl border p-4 shadow-sm" style={{ background: n.style.bg, borderColor: n.style.border }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: n.style.text }}>{n.msg}</p>

                  {"messageTexte" in n && n.messageTexte && n.statut === "en_attente" && (
                    <p className="mt-1 text-xs italic text-gray-500">"{n.messageTexte}"</p>
                  )}

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>

                  <div className="mt-2 flex gap-2">
                    {n.kind === "reservation" && n.statut === "en_attente" && (
                      <Link href="/dashboard/coach/cours-a-venir"
                        className="inline-block rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                        style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                        Gérer la demande →
                      </Link>
                    )}
                    {n.kind === "notif" && n.type === "abonnement" && n.meta?.client_id && (
                      <Link href={`/dashboard/coach/messages`}
                        className="inline-block rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                        style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                        Envoyer un message →
                      </Link>
                    )}
                  </div>
                </div>

                {n.kind === "notif" && !n.lu && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: GOLD }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
