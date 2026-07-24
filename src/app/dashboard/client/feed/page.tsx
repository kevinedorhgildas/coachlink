import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PublicationCard from "@/components/PublicationCard";

export default async function ClientFeedPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  // Coachs avec qui le client a des réservations
  const { data: reservations } = await supabase
    .from("reservations")
    .select("coach_id")
    .eq("client_id", userData.user.id);

  const coachIds = [...new Set((reservations ?? []).map((r) => r.coach_id))];

  // Publications de ces coachs
  let pubs: { id: string; contenu: string; media_url: string | null; type: string; created_at: string; coach_id: string }[] = [];
  if (coachIds.length > 0) {
    const { data } = await supabase
      .from("publications")
      .select("id, contenu, media_url, type, created_at, coach_id")
      .in("coach_id", coachIds)
      .order("created_at", { ascending: false })
      .limit(50);
    pubs = data ?? [];
  }

  // Enrichir avec profils coaches + likes + commentaires
  const pubsEnrichies = await Promise.all(pubs.map(async (p) => {
    const [{ data: coachData }, { count: nb_likes }, { data: liked }, { data: comms }] = await Promise.all([
      supabase.from("coaches").select("photo_url, profiles(nom)").eq("id", p.coach_id).single(),
      supabase.from("publication_likes").select("id", { count: "exact", head: true }).eq("publication_id", p.id),
      supabase.from("publication_likes").select("id").eq("publication_id", p.id).eq("user_id", userData.user.id).maybeSingle(),
      supabase.from("publication_commentaires").select("id, contenu, created_at, profiles(nom)").eq("publication_id", p.id).order("created_at", { ascending: true }),
    ]);
    const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : (coachData?.profiles as unknown) as { nom: string } | null;
    return {
      ...p,
      coach_nom: coachProfile?.nom ?? "Coach",
      coach_photo: coachData?.photo_url ?? null,
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
        <p className="mt-1 text-sm text-gray-500">Les dernières publications de vos coachs.</p>
      </div>

      {pubsEnrichies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          
          <p className="text-sm font-medium text-gray-500">Aucune publication pour l'instant.</p>
          <p className="text-xs text-gray-400 mt-1">Les publications de vos coachs apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pubsEnrichies.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} currentUserId={userData.user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
