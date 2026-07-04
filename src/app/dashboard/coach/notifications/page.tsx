import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const NOTIF_STYLE = {
  confirmee: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", icon: "✅" },
  refusee:   { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: "❌" },
  en_attente:{ bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "📩" },
};

export default async function CoachNotificationsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, created_at, message, profiles!reservations_client_id_fkey(id, nom, photo_url)")
    .eq("coach_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const notifications = (reservations ?? []).map((r) => {
    const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { id: string; nom: string; photo_url: string | null } | null;
    const nomClient = clientProfile?.nom ?? "Un client";
    const date = new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const style = NOTIF_STYLE[r.statut as keyof typeof NOTIF_STYLE] ?? NOTIF_STYLE.en_attente;

    const msg = r.statut === "confirmee"
      ? `Vous avez confirmé la réservation de ${nomClient} pour le ${date}.`
      : r.statut === "refusee"
      ? `Vous avez refusé la demande de ${nomClient} pour le ${date}.`
      : `${nomClient} a demandé une réservation pour le ${date}.`;

    return { ...r, style, msg, clientProfile };
  });

  const nbEnAttente = notifications.filter((n) => n.statut === "en_attente").length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Demandes de réservation et mises à jour.</p>
        </div>
        {nbEnAttente > 0 && (
          <span className="rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            {nbEnAttente} en attente
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: `${GOLD}22` }}>🔔</div>
          <p className="font-medium text-gray-700">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-2xl border p-4 shadow-sm" style={{ background: n.style.bg, borderColor: n.style.border }}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{n.style.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: n.style.text }}>{n.msg}</p>
                  {n.message && n.statut === "en_attente" && (
                    <p className="mt-1 text-xs italic text-gray-500">"{n.message}"</p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {n.statut === "en_attente" && (
                    <Link href="/dashboard/coach/cours-a-venir" className="mt-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
                      Gérer la demande →
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
