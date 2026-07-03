import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VitrineManager from "./VitrineManager";

export default async function CoachVitrinePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: medias }, { data: temoignages }] = await Promise.all([
    supabase.from("media_coach").select("id, type, url, legende, created_at").eq("coach_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("temoignages").select("id, auteur, contenu, note, created_at").eq("coach_id", userData.user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ma vitrine</h1>
        <p className="mt-1 text-sm text-gray-500">Photos, vidéos et témoignages visibles sur votre profil public.</p>
      </div>
      <VitrineManager medias={medias ?? []} temoignages={temoignages ?? []} coachId={userData.user.id} />
    </div>
  );
}
