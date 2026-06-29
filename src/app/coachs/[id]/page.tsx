import { notFound } from "next/navigation";
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

  const [{ data: disponibilites }, { data: avis }, { data: userData }] = await Promise.all([
    supabase
      .from("disponibilites")
      .select("id, jour_semaine, heure_debut, heure_fin")
      .eq("coach_id", params.id),
    supabase
      .from("avis")
      .select("id, note, commentaire, created_at")
      .eq("coach_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
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
