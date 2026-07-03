import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ContactForm from "./ContactForm";
import AvisForm from "./AvisForm";
import ReservationForm from "./ReservationForm";

const JOURS_ORDRE = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

export default async function CoachProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from("coaches")
    .select("*, profiles(nom, email)")
    .eq("id", params.id)
    .single();

  if (!coach) {
    notFound();
  }

  const profileData = coach.profiles as unknown as { nom: string; email: string } | { nom: string; email: string }[] | null;
  const profile = Array.isArray(profileData) ? profileData[0] : profileData;

  const [{ data: disponibilites }, { data: avis }, { data: userData }, { data: documents }, { data: medias }, { data: temoignages }] = await Promise.all([
    supabase.from("disponibilites").select("id, jour_semaine, heure_debut, heure_fin").eq("coach_id", params.id),
    supabase.from("avis").select("id, note, commentaire, created_at").eq("coach_id", params.id).order("created_at", { ascending: false }),
    supabase.auth.getUser(),
    supabase.from("documents").select("id, nom, url").eq("coach_id", params.id).order("created_at", { ascending: false }),
    supabase.from("media_coach").select("id, type, url, legende").eq("coach_id", params.id).order("created_at", { ascending: false }),
    supabase.from("temoignages").select("id, auteur, contenu, note, created_at").eq("coach_id", params.id).order("created_at", { ascending: false }),
  ]);

  const disposTriees = (disponibilites ?? []).sort(
    (a, b) => JOURS_ORDRE.indexOf(a.jour_semaine) - JOURS_ORDRE.indexOf(b.jour_semaine)
  );

  const noteMoyenne =
    avis && avis.length > 0
      ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
      : null;

  const currentUserId = userData.user?.id;
  let isClient = false;
  if (currentUserId) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUserId)
      .single();
    isClient = viewerProfile?.role === "client";
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-start gap-6">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-gray-100">
          {coach.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.photo_url} alt={profile?.nom ?? "Coach"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              Pas de photo
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.nom}</h1>
          <p className="mt-1 text-gray-600">{coach.specialite}</p>
          <p className="mt-1 text-sm text-gray-500">{coach.ville}</p>
          <p className="mt-2 text-lg font-semibold text-blue-600">{coach.tarif_horaire} €/h</p>
          {noteMoyenne !== null && (
            <p className="mt-1 text-sm text-amber-600">
              {"★".repeat(Math.round(noteMoyenne))}{"☆".repeat(5 - Math.round(noteMoyenne))}{" "}
              <span className="text-gray-500">
                {noteMoyenne.toFixed(1)} / 5 ({avis?.length} avis)
              </span>
            </p>
          )}
        </div>
      </div>

      {coach.description && (
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">À propos</h2>
          <p className="whitespace-pre-line text-gray-700">{coach.description}</p>
        </div>
      )}

      {coach.diplomes && coach.diplomes.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Diplômes</h2>
          <ul className="space-y-1">
            {(coach.diplomes as string[]).map((d: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-blue-500">🎓</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {coach.competences && coach.competences.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {(coach.competences as string[]).map((c: string, i: number) => (
              <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {coach.experiences && (coach.experiences as unknown[]).length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Expériences professionnelles</h2>
          <div className="space-y-3">
            {(coach.experiences as { titre: string; entreprise: string; duree: string; description: string }[]).map((exp, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="font-medium text-gray-900">{exp.titre}</p>
                {exp.entreprise && (
                  <p className="text-sm text-gray-600">{exp.entreprise}{exp.duree ? ` · ${exp.duree}` : ""}</p>
                )}
                {exp.description && <p className="mt-1 text-sm text-gray-500">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Programmes & documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:border-blue-300"
              >
                <span className="text-2xl">📄</span>
                <span className="flex-1 text-sm font-medium text-gray-800">{doc.nom}</span>
                <span className="text-xs text-blue-600">Télécharger →</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {medias && medias.filter((m) => m.type === "photo").length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Photos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {medias.filter((m) => m.type === "photo").map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.legende ?? ""} className="h-40 w-full object-cover" />
                {m.legende && <p className="truncate bg-white px-2 py-1 text-xs text-gray-500">{m.legende}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {medias && medias.filter((m) => m.type === "video").length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Vidéos</h2>
            <Link href={`/coachs/${params.id}/videos`} className="text-sm font-medium text-blue-600 hover:underline">
              Voir en plein écran →
            </Link>
          </div>
          <div className="space-y-3">
            {medias.filter((m) => m.type === "video").slice(0, 2).map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border border-gray-200 bg-black">
                <video src={m.url} controls className="w-full max-h-72" />
                {m.legende && <p className="bg-white px-3 py-2 text-xs text-gray-500">{m.legende}</p>}
              </div>
            ))}
            {medias.filter((m) => m.type === "video").length > 2 && (
              <Link href={`/coachs/${params.id}/videos`} className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-600 hover:bg-gray-100">
                + {medias.filter((m) => m.type === "video").length - 2} vidéo{medias.filter((m) => m.type === "video").length - 2 > 1 ? "s" : ""} supplémentaire{medias.filter((m) => m.type === "video").length - 2 > 1 ? "s" : ""}
              </Link>
            )}
          </div>
        </div>
      )}

      {temoignages && temoignages.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Témoignages d'élèves</h2>
          <div className="space-y-3">
            {temoignages.map((t) => (
              <div key={t.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{t.auteur}</p>
                  {t.note && <span className="text-sm text-amber-500">{"★".repeat(t.note)}{"☆".repeat(5 - t.note)}</span>}
                </div>
                <p className="text-sm text-gray-600 italic">"{t.contenu}"</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Disponibilités</h2>
        {disposTriees.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune disponibilité renseignée.</p>
        ) : (
          <ul className="space-y-1 text-sm text-gray-700">
            {disposTriees.map((d) => (
              <li key={d.id} className="capitalize">
                {d.jour_semaine} : {d.heure_debut.slice(0, 5)} – {d.heure_fin.slice(0, 5)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Avis</h2>
        {!avis || avis.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun avis pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {avis.map((a) => (
              <li key={a.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-amber-600">{"★".repeat(a.note)}{"☆".repeat(5 - a.note)}</p>
                {a.commentaire && <p className="mt-1 text-sm text-gray-700">{a.commentaire}</p>}
                <p className="mt-1 text-xs text-gray-400">Avis client</p>
              </li>
            ))}
          </ul>
        )}

        {isClient && (
          <div className="mt-4">
            <AvisForm coachId={coach.id} />
          </div>
        )}
      </div>

      {isClient && (
        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Réserver un créneau</h2>
          <ReservationForm coachId={coach.id} disponibilites={disposTriees} />
        </div>
      )}

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Contacter ce coach</h2>
        <ContactForm coachId={coach.id} coachNom={profile?.nom ?? "ce coach"} />
      </div>
    </main>
  );
}
