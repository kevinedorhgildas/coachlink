import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import PhotoUpload from "./PhotoUpload";
import DisponibilitesManager from "./DisponibilitesManager";
import ReservationsList from "./ReservationsList";
import ParcoursForm from "./ParcoursForm";

export default async function DashboardCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/connexion");
  }

  const userId = userData.user.id;

  const { data: profile } = await supabase.from("profiles").select("nom").eq("id", userId).single();

  const [{ data: coach }, { data: disponibilites }, { data: reservations }] = await Promise.all([
    supabase.from("coaches").select("*, tarif_individuel, tarif_groupe, tarif_enligne").eq("id", userId).single(),
    supabase
      .from("disponibilites")
      .select("id, jour_semaine, heure_debut, heure_fin")
      .eq("coach_id", userId),
    supabase
      .from("reservations")
      .select("id, date_souhaitee, message, statut, type_seance, lien_visio, disponibilites(jour_semaine, heure_debut, heure_fin)")
      .eq("coach_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mon profil</h1>
        <p className="mt-1 text-sm text-gray-500">Modifiez vos informations visibles par les clients.</p>
      </div>

      <PhotoUpload photoUrl={coach?.photo_url ?? null} />
      <ProfileForm coach={{ specialite: coach?.specialite ?? null, ville: coach?.ville ?? null, tarif_horaire: coach?.tarif_horaire ?? null, tarif_individuel: (coach as Record<string,unknown>)?.tarif_individuel as number|null ?? null, tarif_groupe: (coach as Record<string,unknown>)?.tarif_groupe as number|null ?? null, tarif_enligne: (coach as Record<string,unknown>)?.tarif_enligne as number|null ?? null, description: coach?.description ?? null }} />
      <ParcoursForm parcours={{
        diplomes: coach?.diplomes ?? [],
        competences: coach?.competences ?? [],
        experiences: coach?.experiences ?? [],
      }} />
      <DisponibilitesManager disponibilites={disponibilites ?? []} />
      <ReservationsList reservations={reservations ?? []} />
    </div>
  );
}
