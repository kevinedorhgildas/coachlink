import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VitrineManager from "./VitrineManager";
import PhotoGallery from "@/app/coachs/[id]/photos/PhotoGallery";
import PlanGate from "@/components/PlanGate";
import { canAccess } from "@/lib/plans";

const GOLD = "#C9A96E";

export default async function CoachVitrinePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: coachPlan } = await supabase.from("coaches").select("abonnement").eq("id", userData.user.id).single();
  const plan = ((coachPlan as Record<string,unknown>)?.abonnement as string) ?? "gratuit";
  if (!canAccess(plan as Parameters<typeof canAccess>[0], "vitrine")) return <PlanGate feature="Ma vitrine" plan="starter" />;

  const [{ data: medias }, { data: temoignages }] = await Promise.all([
    supabase.from("media_coach").select("id, type, url, legende, created_at").eq("coach_id", userData.user.id).order("created_at", { ascending: false }),
    supabase.from("temoignages").select("id, auteur, contenu, note, created_at").eq("coach_id", userData.user.id).order("created_at", { ascending: false }),
  ]);

  const temoignagesList = temoignages ?? [];
  const photos = (medias ?? []).filter((m) => m.type === "photo");
  const videos = (medias ?? []).filter((m) => m.type === "video");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ma vitrine</h1>
        <p className="mt-1 text-sm text-gray-500">Photos, vidéos et témoignages visibles sur votre profil public.</p>
      </div>

      <VitrineManager medias={medias ?? []} temoignages={temoignagesList} coachId={userData.user.id} />

      {photos.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Mes photos <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{photos.length}</span></h2>
            <Link href={`/coachs/${userData.user.id}/photos`} target="_blank" className="text-xs font-medium transition hover:opacity-70" style={{ color: GOLD }}>
              ⛶ Voir en plein écran →
            </Link>
          </div>
          <PhotoGallery photos={photos} />
        </div>
      )}

      {videos.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Mes vidéos <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{videos.length}</span></h2>
            <Link href={`/coachs/${userData.user.id}/videos`} target="_blank" className="text-xs font-medium transition hover:opacity-70" style={{ color: GOLD }}>
              ⛶ Voir en plein écran →
            </Link>
          </div>
          <div className="space-y-3">
            {videos.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border border-gray-200 bg-black">
                <video src={m.url} controls className="w-full max-h-64" />
                {m.legende && <p className="bg-white px-3 py-2 text-xs text-gray-500">{m.legende}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {temoignagesList.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Aperçu des témoignages <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{temoignagesList.length}</span>
          </h2>
          <div className="space-y-3">
            {temoignagesList.map((t) => (
              <div key={t.id} className="rounded-xl border p-4" style={{ borderColor: `${GOLD}33`, background: `${GOLD}08` }}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{t.auteur}</p>
                  {t.note && <span className="text-sm" style={{ color: GOLD }}>{"★".repeat(t.note)}{"☆".repeat(5 - (t.note ?? 0))}</span>}
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
