import { redirect } from "next/navigation";
import Link from "next/link";
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

      {(medias ?? []).filter((m) => m.type === "photo").length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Mes photos ({(medias ?? []).filter((m) => m.type === "photo").length})</h2>
            <Link href={`/coachs/${userData.user.id}/photos`} target="_blank" className="text-xs font-medium text-emerald-600 hover:underline">⛶ Voir en plein écran →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(medias ?? []).filter((m) => m.type === "photo").map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.legende ?? ""} className="h-40 w-full object-cover" />
                {m.legende && <p className="truncate bg-white px-2 py-1 text-xs text-gray-500">{m.legende}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(medias ?? []).filter((m) => m.type === "video").length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Mes vidéos ({(medias ?? []).filter((m) => m.type === "video").length})</h2>
            <Link href={`/coachs/${userData.user.id}/videos`} target="_blank" className="text-xs font-medium text-emerald-600 hover:underline">
              ⛶ Voir en plein écran →
            </Link>
          </div>
          <div className="space-y-3">
            {(medias ?? []).filter((m) => m.type === "video").map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border border-gray-200 bg-black">
                <video src={m.url} controls className="w-full max-h-64" />
                {m.legende && <p className="bg-white px-3 py-2 text-xs text-gray-500">{m.legende}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

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
