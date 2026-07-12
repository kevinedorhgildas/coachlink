import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewPublicationForm from "./NewPublicationForm";
import PublicationsFeed from "./PublicationsFeed";

export default async function PublicationsCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: profile }, { data: coach }, { data: pubs }] = await Promise.all([
    supabase.from("profiles").select("nom").eq("id", userData.user.id).single(),
    supabase.from("coaches").select("photo_url").eq("id", userData.user.id).single(),
    supabase.from("publications")
      .select("id, contenu, media_url, type, created_at")
      .eq("coach_id", userData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Enrichir avec likes et commentaires
  const pubsEnrichies = await Promise.all((pubs ?? []).map(async (p) => {
    const [{ count: nb_likes }, { data: liked }, { data: comms }] = await Promise.all([
      supabase.from("publication_likes").select("id", { count: "exact", head: true }).eq("publication_id", p.id),
      supabase.from("publication_likes").select("id").eq("publication_id", p.id).eq("user_id", userData.user.id).maybeSingle(),
      supabase.from("publication_commentaires").select("id, contenu, created_at, profiles(nom)").eq("publication_id", p.id).order("created_at", { ascending: true }),
    ]);
    return {
      ...p,
      coach_nom: profile?.nom ?? "Coach",
      coach_photo: coach?.photo_url ?? null,
      coach_id: userData.user.id,
      nb_likes: nb_likes ?? 0,
      liked_by_me: !!liked,
      commentaires: (comms ?? []).map((c) => {
        const pr = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles as { nom: string } | null;
        return { id: c.id, contenu: c.contenu, created_at: c.created_at, auteur_nom: pr?.nom ?? "?" };
      }),
    };
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fil d'actualité</h1>
        <p className="mt-1 text-sm text-gray-500">Publiez des contenus visibles par vos clients et sur votre profil.</p>
      </div>

      <NewPublicationForm coachNom={profile?.nom ?? "Coach"} coachPhoto={coach?.photo_url ?? null} />
      <PublicationsFeed pubs={pubsEnrichies} currentUserId={userData.user.id} />
    </div>
  );
}
