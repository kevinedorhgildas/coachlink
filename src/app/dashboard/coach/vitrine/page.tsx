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

  const temoignagesList = temoignages ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ma vitrine</h1>
        <p className="mt-1 text-sm text-gray-500">Photos, vidéos et témoignages visibles sur votre profil public.</p>
      </div>

      <VitrineManager medias={medias ?? []} temoignages={temoignagesList} coachId={userData.user.id} />

      {temoignagesList.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-900">Aperçu des témoignages ({temoignagesList.length})</h2>
          <div className="space-y-3">
            {temoignagesList.map((t) => (
              <div key={t.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{t.auteur}</p>
                  {t.note && <span className="text-sm text-amber-500">{"★".repeat(t.note)}{"☆".repeat(5 - (t.note ?? 0))}</span>}
                </div>
                <p className="text-sm text-gray-600 italic">"{t.contenu}"</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(t.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
