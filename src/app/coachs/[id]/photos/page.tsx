import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PhotoGallery from "./PhotoGallery";

const GOLD = "#C9A96E";

export default async function CoachPhotosPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: coach }, { data: medias }] = await Promise.all([
    supabase.from("coaches").select("*, profiles(nom)").eq("id", params.id).single(),
    supabase.from("media_coach").select("id, url, legende").eq("coach_id", params.id).eq("type", "photo").order("created_at", { ascending: false }),
  ]);

  if (!coach) notFound();

  const profileData = coach.profiles as unknown as { nom: string } | { nom: string }[] | null;
  const nom = Array.isArray(profileData) ? profileData[0]?.nom : profileData?.nom;

  if (!medias || medias.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ background: "#0B1120" }}>
        <div className="mb-4 h-0.5 w-12 rounded-full mx-auto" style={{ background: `${GOLD}44` }} />
        <p className="text-lg font-semibold text-white mb-2">Aucune photo disponible</p>
        <Link href={`/coachs/${params.id}`} className="text-sm transition hover:opacity-70" style={{ color: GOLD }}>← Retour au profil</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: "#0B1120" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Photos de {nom}</h1>
            <p className="mt-1 text-sm" style={{ color: `${GOLD}99` }}>
              {medias.length} photo{medias.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/coachs/${params.id}`}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: `${GOLD}66`, color: GOLD, background: `${GOLD}11` }}
          >
            ← Retour au profil
          </Link>
        </div>
        <PhotoGallery photos={medias} />
      </div>
    </main>
  );
}
