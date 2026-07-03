import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

    let icon = "📌";
    let message = `Demande de réservation envoyée à ${nomCoach} pour le ${date}.`;
    let color = "bg-amber-50 border-amber-200";
    let textColor = "text-amber-700";

    if (r.statut === "confirmee") {
      icon = "✅";
      message = `${nomCoach} a confirmé votre réservation du ${date}.`;
      color = "bg-emerald-50 border-emerald-200";
      textColor = "text-emerald-700";
    } else if (r.statut === "refusee") {
      icon = "❌";
      message = `${nomCoach} a refusé votre demande pour le ${date}.`;
      color = "bg-red-50 border-red-200";
      textColor = "text-red-700";
    }

    return { ...r, icon, message, color, textColor, coachData, coachProfile };
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Suivez l'état de vos réservations.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">Aucune notification pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl border p-4 ${n.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.textColor}`}>{n.message}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {n.coachData?.id && (
                    <Link
                      href={`/coachs/${n.coachData.id}`}
                      className="mt-2 inline-block rounded-lg border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
                    >
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
