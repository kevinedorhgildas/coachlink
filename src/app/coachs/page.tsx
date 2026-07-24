import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DOMAINES = [
  "Coach sportif",
  "Coach mental",
  "Coach en développement personnel",
  "Coach en finance",
  "Coach en développement business",
  "Coach marketing",
  "Coach en bien être et santé",
  "Coach en séduction",
  "Coach en langue",
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
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-gray-400 hover:text-gray-700 transition">← Accueil</Link>
        <h1 className="text-3xl font-bold text-navy-900 sm:text-4xl">Nos coachs</h1>
        <p className="mt-2 text-gray-500">
          {domaineActif
            ? <><span className="font-medium" style={{ color: "#C9A96E" }}>{count ?? 0} coach{(count ?? 0) > 1 ? "s" : ""}</span> en {domaineActif}</>
            : <><span className="font-medium" style={{ color: "#C9A96E" }}>{count ?? 0} expert{(count ?? 0) > 1 ? "s" : ""}</span> disponible{(count ?? 0) > 1 ? "s" : ""}</>
          }
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Filtres domaines */}
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href="/coachs"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              !domaineActif
                ? "border-transparent text-navy-900 shadow-sm"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
            style={!domaineActif ? { background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" } : {}}
          >
            Tous
          </Link>
          {DOMAINES.map((label) => (
            <Link
              key={label}
              href={`/coachs?domaine=${encodeURIComponent(label)}${searchParams.ville ? `&ville=${encodeURIComponent(searchParams.ville)}` : ""}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                domaineActif === label
                  ? "border-transparent text-navy-900 shadow-sm"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
              style={domaineActif === label ? { background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" } : {}}
            >
              {label}
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
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-gold-500 focus:outline-none focus:ring-2 transition"
            style={{ ["--tw-ring-color" as string]: "#C9A96E33" }}
          />
          <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" }}>
            Filtrer
          </button>
          {searchParams.ville && (
            <Link href={`/coachs${domaineActif ? `?domaine=${encodeURIComponent(domaineActif)}` : ""}`} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition">
              ✕ Ville
            </Link>
          )}
        </form>

        {/* Liste */}
        {!coaches || coaches.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-2xl mb-3 text-gray-200">—</p>
            <p className="font-medium text-gray-700">Aucun coach trouvé pour ce domaine.</p>
            <Link href="/coachs" className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: "#C9A96E" }}>Voir tous les coachs →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {coaches.map((coach) => {
              const nom = Array.isArray(coach.profiles) ? (coach.profiles[0] as { nom: string })?.nom : (coach.profiles as { nom: string } | null)?.nom;
              return (
                <Link
                  key={coach.id}
                  href={`/coachs/${coach.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-transparent hover:shadow-md"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-transparent transition group-hover:ring-gold-500/30" style={{ ["--tw-ring-color" as string]: "#C9A96E44" }}>
                    {coach.photo_url
                      ? <img src={coach.photo_url} alt={nom ?? ""} className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-300">{nom?.charAt(0).toUpperCase() ?? "?"}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{nom}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{coach.specialite}{coach.ville ? ` · ${coach.ville}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{coach.tarif_horaire} €</p>
                      <p className="text-xs text-gray-400">/ heure</p>
                    </div>
                    <span className="rounded-full border px-4 py-1.5 text-xs font-semibold text-navy-900 transition group-hover:border-transparent group-hover:shadow-sm" style={{ borderColor: "#C9A96E", color: "#9A7A2E", ["--tw-shadow" as string]: "0 2px 8px #C9A96E22" }}>
                      Voir le profil →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-navy-900 shadow-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" }}
          >
            Rejoindre CoachLink →
          </Link>
        </div>
      </div>
    </main>
  );
}
