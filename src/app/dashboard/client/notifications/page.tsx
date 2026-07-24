import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const NOTIF_STYLE = {
  confirmee: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  refusee:   { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  en_attente:{ bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
};

export default async function ClientNotificationsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, created_at, coaches(id, specialite, photo_url, profiles(nom))")
    .eq("client_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const notifications = (reservations ?? []).map((r) => {
    const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
    const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
    const nomCoach = coachProfile?.nom ?? "Votre coach";
    const date = new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const style = NOTIF_STYLE[r.statut as keyof typeof NOTIF_STYLE] ?? NOTIF_STYLE.en_attente;

    const message = r.statut === "confirmee"
      ? `${nomCoach} a confirmé votre réservation du ${date}.`
      : r.statut === "refusee"
      ? `${nomCoach} a refusé votre demande pour le ${date}.`
      : `Demande de réservation envoyée à ${nomCoach} pour le ${date}.`;

    return { ...r, style, message, coachData };
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Suivez l'état de vos réservations.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 h-0.5 w-12 rounded-full" style={{ background: `${GOLD}44` }} />
          <p className="font-medium text-gray-700">Aucune notification pour le moment.</p>
          <Link href="/dashboard/client" className="mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-2xl border p-4 shadow-sm" style={{ background: n.style.bg, borderColor: n.style.border }}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: n.style.text }}>{n.message}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {n.coachData?.id && (
                    <Link href={`/coachs/${n.coachData.id}`} className="mt-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                      Voir le profil →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
