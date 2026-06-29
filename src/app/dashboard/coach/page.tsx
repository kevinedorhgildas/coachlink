import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import ProfileForm from "./ProfileForm";
import PhotoUpload from "./PhotoUpload";
import DisponibilitesManager from "./DisponibilitesManager";
import ReservationsList from "./ReservationsList";

export default async function DashboardCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/connexion");
  }

  const userId = userData.user.id;

  const [{ data: coach }, { data: disponibilites }, { data: reservations }] = await Promise.all([
    supabase.from("coaches").select("*").eq("id", userId).single(),
    supabase
      .from("disponibilites")
      .select("id, jour_semaine, heure_debut, heure_fin")
      .eq("coach_id", userId),
    supabase
      .from("reservations")
      .select("id, date_souhaitee, message, statut, disponibilites(jour_semaine, heure_debut, heure_fin)")
      .eq("coach_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil coach</h1>
        <div className="flex items-center gap-4">
          <Link href={`/coachs/${userId}`} className="text-sm text-blue-600 hover:underline">
            Voir mon profil public
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-500 hover:underline">
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      <PhotoUpload photoUrl={coach?.photo_url ?? null} />
      <ProfileForm coach={coach ?? {}} />
      <DisponibilitesManager disponibilites={disponibilites ?? []} />
      <ReservationsList reservations={reservations ?? []} />
    </main>
  );
}
