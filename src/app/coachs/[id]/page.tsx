import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ContactForm from "./ContactForm";
import AvisForm from "./AvisForm";
import ReservationForm from "./ReservationForm";

const JOURS_ORDRE = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const GOLD = "#C9A96E";

export default async function CoachProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from("coaches")
    .select("*, profiles(nom, email)")
    .eq("id", params.id)
    .single();

  if (!coach) notFound();

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

  const noteMoyenne = avis && avis.length > 0
    ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
    : null;

  const currentUserId = userData.user?.id;
  let isClient = false;
  if (currentUserId) {
    const { data: viewerProfile } = await supabase.from("profiles").select("role").eq("id", currentUserId).single();
    isClient = viewerProfile?.role === "client";
  }

  const photos = (medias ?? []).filter((m) => m.type === "photo");
  const videos = (medias ?? []).filter((m) => m.type === "video");

  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* ── HERO PROFIL ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #060C18 0%, #0B1120 60%, #111827 100%)" }}>
        {/* Glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/2 -translate-y-1/2 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }} />

        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/coachs" className="mb-8 inline-flex items-center gap-2 text-sm transition hover:opacity-80" style={{ color: GOLD + "99" }}>
            ← Retour aux coachs
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl" style={{ outline: `3px solid ${GOLD}44` }}>
              {coach.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.photo_url} alt={profile?.nom ?? "Coach"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}11)` }}>
                  👤
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: GOLD }}>{coach.specialite}</p>
              <h1 className="text-3xl font-bold text-white">{profile?.nom}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {coach.ville && (
                  <span className="text-sm" style={{ color: "#ffffff60" }}>📍 {coach.ville}</span>
                )}
                {noteMoyenne !== null && (
                  <span className="text-sm" style={{ color: GOLD }}>
                    {"★".repeat(Math.round(noteMoyenne))}{"☆".repeat(5 - Math.round(noteMoyenne))}{" "}
                    <span style={{ color: "#ffffff60" }}>{noteMoyenne.toFixed(1)} ({avis?.length} avis)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tarif */}
            <div className="rounded-2xl px-5 py-3 text-center shrink-0" style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}11)`, border: `1px solid ${GOLD}44` }}>
              <p className="text-2xl font-bold text-white">{coach.tarif_horaire} €</p>
              <p className="text-xs" style={{ color: GOLD }}>par heure</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">

        {/* À propos */}
        {coach.description && (
          <section>
            <SectionTitle>À propos</SectionTitle>
            <p className="whitespace-pre-line leading-relaxed text-gray-600">{coach.description}</p>
          </section>
        )}

        {/* Diplômes */}
        {coach.diplomes && (coach.diplomes as string[]).length > 0 && (
          <section>
            <SectionTitle>Diplômes</SectionTitle>
            <ul className="space-y-2">
              {(coach.diplomes as string[]).map((d, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm shrink-0" style={{ background: `${GOLD}22`, color: GOLD }}>🎓</span>
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Compétences */}
        {coach.competences && (coach.competences as string[]).length > 0 && (
          <section>
            <SectionTitle>Compétences</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {(coach.competences as string[]).map((c, i) => (
                <span key={i} className="rounded-full border px-4 py-1.5 text-sm font-medium" style={{ borderColor: `${GOLD}44`, color: "#9A7A2E", background: `${GOLD}11` }}>
                  {c}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Expériences */}
        {coach.experiences && (coach.experiences as unknown[]).length > 0 && (
          <section>
            <SectionTitle>Expériences</SectionTitle>
            <div className="space-y-3">
              {(coach.experiences as { titre: string; entreprise: string; duree: string; description: string }[]).map((exp, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="font-semibold text-gray-900">{exp.titre}</p>
                  {exp.entreprise && <p className="text-sm text-gray-500 mt-0.5">{exp.entreprise}{exp.duree ? ` · ${exp.duree}` : ""}</p>}
                  {exp.description && <p className="mt-2 text-sm text-gray-600">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <section>
            <SectionTitle>Programmes & documents</SectionTitle>
            <div className="space-y-2">
              {documents.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm transition hover:border-transparent hover:shadow-md">
                  <span className="text-xl">📄</span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{doc.nom}</span>
                  <span className="text-xs font-semibold" style={{ color: GOLD }}>Télécharger →</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle noBorder>Photos</SectionTitle>
              <Link href={`/coachs/${params.id}/photos`} className="text-sm font-semibold hover:underline" style={{ color: GOLD }}>Voir toutes →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((m) => (
                <div key={m.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.legende ?? ""} className="h-40 w-full object-cover transition duration-300 group-hover:scale-105" />
                  {m.legende && <p className="truncate px-3 py-1.5 text-xs text-gray-400">{m.legende}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vidéos */}
        {videos.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle noBorder>Vidéos</SectionTitle>
              <Link href={`/coachs/${params.id}/videos`} className="text-sm font-semibold hover:underline" style={{ color: GOLD }}>Voir en plein écran →</Link>
            </div>
            <div className="space-y-3">
              {videos.slice(0, 2).map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
                  <video src={m.url} controls className="w-full max-h-72" />
                  {m.legende && <p className="bg-white px-4 py-2 text-xs text-gray-400">{m.legende}</p>}
                </div>
              ))}
              {videos.length > 2 && (
                <Link href={`/coachs/${params.id}/videos`} className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-500 shadow-sm transition hover:shadow-md">
                  + {videos.length - 2} vidéo{videos.length - 2 > 1 ? "s" : ""} supplémentaire{videos.length - 2 > 1 ? "s" : ""}
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Témoignages */}
        {temoignages && temoignages.length > 0 && (
          <section>
            <SectionTitle>Témoignages d'élèves</SectionTitle>
            <div className="space-y-3">
              {temoignages.map((t) => (
                <div key={t.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{t.auteur}</p>
                    {t.note && <span className="text-sm" style={{ color: GOLD }}>{"★".repeat(t.note)}{"☆".repeat(5 - t.note)}</span>}
                  </div>
                  <p className="text-sm text-gray-600 italic leading-relaxed">"{t.contenu}"</p>
                  <p className="mt-2 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Disponibilités */}
        <section>
          <SectionTitle>Disponibilités</SectionTitle>
          {disposTriees.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune disponibilité renseignée.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {disposTriees.map((d) => (
                <div key={d.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide capitalize" style={{ color: GOLD }}>{d.jour_semaine}</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">{d.heure_debut.slice(0, 5)} – {d.heure_fin.slice(0, 5)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Avis */}
        <section>
          <SectionTitle>Avis clients</SectionTitle>
          {!avis || avis.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun avis pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {avis.map((a) => (
                <li key={a.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm mb-1" style={{ color: GOLD }}>{"★".repeat(a.note)}{"☆".repeat(5 - a.note)}</p>
                  {a.commentaire && <p className="text-sm text-gray-700">{a.commentaire}</p>}
                  <p className="mt-2 text-xs text-gray-400">Avis vérifié</p>
                </li>
              ))}
            </ul>
          )}
          {isClient && <div className="mt-4"><AvisForm coachId={coach.id} /></div>}
        </section>

        {/* Réservation */}
        {isClient && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle noBorder>Réserver un créneau</SectionTitle>
            <ReservationForm coachId={coach.id} disponibilites={disposTriees} coach={{ tarif_horaire: coach.tarif_horaire, tarif_individuel: (coach as Record<string, unknown>).tarif_individuel as number | null, tarif_groupe: (coach as Record<string, unknown>).tarif_groupe as number | null, tarif_enligne: (coach as Record<string, unknown>).tarif_enligne as number | null }} />
          </section>
        )}

        {/* Contact */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle noBorder>Contacter ce coach</SectionTitle>
          <ContactForm coachId={coach.id} coachNom={profile?.nom ?? "ce coach"} />
        </section>

      </div>
    </main>
  );
}

function SectionTitle({ children, noBorder }: { children: React.ReactNode; noBorder?: boolean }) {
  return (
    <h2 className={`text-lg font-bold text-gray-900 ${noBorder ? "" : "mb-4 pb-2 border-b border-gray-100"}`}>
      {children}
    </h2>
  );
}
