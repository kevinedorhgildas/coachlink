import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DOMAINES = [
  { label: "Coach sportif", icon: "🏋️" },
  { label: "Coach mental", icon: "🧠" },
  { label: "Coach en développement personnel", icon: "🌱" },
  { label: "Coach en finance", icon: "💰" },
  { label: "Coach en développement business", icon: "🚀" },
  { label: "Coach marketing", icon: "📣" },
  { label: "Coach en bien être et santé", icon: "🧘" },
  { label: "Coach en séduction", icon: "💫" },
  { label: "Coach en langue", icon: "🌍" },
];

export default async function CoachsPage({
  searchParams,
}: {
  searchParams: { domaine?: string; ville?: string };
}) {
  const supabase = await createClient();

  let query = supabase
    .from("coaches")
    .select("id, specialite, ville, tarif_horaire, photo_url, profiles(nom)", { count: "exact" });

  if (searchParams.domaine) query = query.ilike("specialite", `%${searchParams.domaine}%`);
  if (searchParams.ville) query = query.ilike("ville", `%${searchParams.ville}%`);

  const { data: coaches, count } = await query.order("tarif_horaire", { ascending: true });

  const domaineActif = searchParams.domaine ?? null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Nos coachs</h1>
        <p className="mt-2 text-gray-500">
          {domaineActif ? `${count ?? 0} coach${(count ?? 0) > 1 ? "s" : ""} en ${domaineActif}` : `${count ?? 0} coach${(count ?? 0) > 1 ? "s" : ""} disponible${(count ?? 0) > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filtres domaines */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/coachs"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            !domaineActif ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
          }`}
        >
          Tous
        </Link>
        {DOMAINES.map(({ label, icon }) => (
          <Link
            key={label}
            href={`/coachs?domaine=${encodeURIComponent(label)}${searchParams.ville ? `&ville=${encodeURIComponent(searchParams.ville)}` : ""}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              domaineActif === label ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {icon} {label}
          </Link>
        ))}
      </div>

      {/* Filtre ville */}
      <form className="mb-8 flex gap-2">
        {domaineActif && <input type="hidden" name="domaine" value={domaineActif} />}
        <input
          name="ville"
          type="text"
          defaultValue={searchParams.ville ?? ""}
          placeholder="Filtrer par ville..."
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Filtrer
        </button>
        {searchParams.ville && (
          <Link href={`/coachs${domaineActif ? `?domaine=${encodeURIComponent(domaineActif)}` : ""}`} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
            ✕ Ville
          </Link>
        )}
      </form>

      {/* Liste */}
      {!coaches || coaches.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">Aucun coach trouvé pour ce domaine.</p>
          <Link href="/coachs" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Voir tous les coachs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {coaches.map((coach) => {
            const nom = Array.isArray(coach.profiles) ? (coach.profiles[0] as { nom: string })?.nom : (coach.profiles as { nom: string } | null)?.nom;
            return (
              <Link
                key={coach.id}
                href={`/coachs/${coach.id}`}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                  {coach.photo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={coach.photo_url} alt={nom ?? ""} className="h-full w-full object-cover" />
                    : <span className="text-2xl text-gray-300">👤</span>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{nom}</p>
                  <p className="text-sm text-gray-500">{coach.specialite} · {coach.ville}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-blue-600">{coach.tarif_horaire} €/h</p>
                  <span className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition">
                    Voir le profil →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/inscription" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Rejoindre CoachLink →
        </Link>
      </div>
    </main>
  );
}
