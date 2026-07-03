import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VideoPlayer from "./VideoPlayer";

export default async function CoachVideosPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: coach }, { data: medias }] = await Promise.all([
    supabase.from("coaches").select("*, profiles(nom)").eq("id", params.id).single(),
    supabase.from("media_coach").select("id, url, legende, created_at").eq("coach_id", params.id).eq("type", "video").order("created_at", { ascending: false }),
  ]);

  if (!coach) notFound();

  const profileData = coach.profiles as unknown as { nom: string } | { nom: string }[] | null;
  const nom = Array.isArray(profileData) ? profileData[0]?.nom : profileData?.nom;

  if (!medias || medias.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
        <p className="text-xl text-white mb-4">Aucune vidéo disponible</p>
        <Link href={`/coachs/${params.id}`} className="text-sm text-gray-400 hover:text-white">← Retour au profil</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Vidéos de {nom}</h1>
            <p className="mt-1 text-sm text-gray-400">{medias.length} vidéo{medias.length > 1 ? "s" : ""}</p>
          </div>
          <Link href={`/coachs/${params.id}`} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition">
            ← Retour au profil
          </Link>
        </div>

        <VideoPlayer videos={medias} />
      </div>
    </main>
  );
}
