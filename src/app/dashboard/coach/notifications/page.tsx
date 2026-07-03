import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

    let icon = "📩";
    let message = `${nomClient} a demandé une réservation pour le ${date}.`;
    let color = "bg-amber-50 border-amber-200";
    let textColor = "text-amber-700";

    if (r.statut === "confirmee") {
      icon = "✅";
      message = `Vous avez confirmé la réservation de ${nomClient} pour le ${date}.`;
      color = "bg-emerald-50 border-emerald-200";
      textColor = "text-emerald-700";
    } else if (r.statut === "refusee") {
      icon = "❌";
      message = `Vous avez refusé la demande de ${nomClient} pour le ${date}.`;
      color = "bg-red-50 border-red-200";
      textColor = "text-red-700";
    }

    return { ...r, icon, message, color, textColor, clientProfile };
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
          <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold text-white">
            {nbEnAttente} en attente
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl border p-4 ${n.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.textColor}`}>{n.message}</p>
                  {n.message && n.statut === "en_attente" && (
                    <p className="mt-1 text-xs italic text-gray-500">"{n.message}"</p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {n.statut === "en_attente" && (
                    <Link
                      href="/dashboard/coach/cours-a-venir"
                      className="mt-2 inline-block rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
                    >
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
