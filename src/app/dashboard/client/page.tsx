import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAR_PAGE = 10;

const card = "rounded-2xl p-5 shadow-sm" as const;
const cardStyle = { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" };

export default async function DashboardClientPage({
  searchParams,
}: {
  searchParams: { specialite?: string; ville?: string; tarif_max?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom")
    .eq("id", userData.user.id)
    .single();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, coaches(id, profiles(nom)), disponibilites(jour_semaine, heure_debut, heure_fin)")
    .eq("client_id", userData.user.id)
    .order("created_at", { ascending: false });

  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAR_PAGE;
  const to = from + PAR_PAGE - 1;

  let query = supabase
    .from("coaches")
    .select("id, specialite, ville, tarif_horaire, photo_url, profiles(nom)", { count: "exact" });

  if (searchParams.specialite) query = query.ilike("specialite", `%${searchParams.specialite}%`);
  if (searchParams.ville) query = query.ilike("ville", `%${searchParams.ville}%`);
  if (searchParams.tarif_max) query = query.lte("tarif_horaire", Number(searchParams.tarif_max));

  const { data: coaches, count } = await query.order("tarif_horaire", { ascending: true }).range(from, to);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAR_PAGE));

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (searchParams.specialite) params.set("specialite", searchParams.specialite);
    if (searchParams.ville) params.set("ville", searchParams.ville);
    if (searchParams.tarif_max) params.set("tarif_max", searchParams.tarif_max);
    params.set("page", String(targetPage));
    return `/dashboard/client?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bonjour, {profile?.nom?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Trouvez votre coach idéal parmi nos experts.</p>
      </div>

      {/* Réservations en cours */}
      {reservations && reservations.length > 0 && (
        <div className={card} style={cardStyle}>
          <h2 className="mb-4 text-base font-semibold text-gray-800">Mes réservations en cours</h2>
          <ul className="space-y-2">
            {reservations.slice(0, 3).map((r) => {
              const coachData = r.coaches as unknown as { id: string; profiles: { nom: string } | { nom: string }[] | null } | { id: string; profiles: { nom: string } | { nom: string }[] | null }[] | null;
              const coachObj = Array.isArray(coachData) ? coachData[0] : coachData;
              const coachProfile = Array.isArray(coachObj?.profiles) ? coachObj?.profiles[0] : coachObj?.profiles;
              const dispoData = r.disponibilites as unknown as { jour_semaine: string; heure_debut: string; heure_fin: string } | { jour_semaine: string; heure_debut: string; heure_fin: string }[] | null;
              const dispo = Array.isArray(dispoData) ? dispoData[0] : dispoData;

              const badges: Record<string, { bg: string; text: string; label: string }> = {
                en_attente: { bg: "bg-amber-50", text: "text-amber-700", label: "En attente" },
                confirmee: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmée" },
                refusee: { bg: "bg-red-50", text: "text-red-700", label: "Refusée" },
              };
              const badge = badges[r.statut];

              return (
                <li key={r.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      {coachObj && <Link href={`/coachs/${coachObj.id}`} className="hover:underline">{coachProfile?.nom}</Link>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(r.date_souhaitee).toLocaleDateString("fr-FR")}
                      {dispo && <span> · {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge?.bg} ${badge?.text}`}>{badge?.label}</span>
                </li>
              );
            })}
          </ul>
          {reservations.length > 3 && (
            <Link href="/dashboard/client/reservations" className="mt-3 inline-block text-xs font-medium text-purple-600 hover:underline">
              Voir toutes les réservations →
            </Link>
          )}
        </div>
      )}

      {/* Recherche */}
      <form className={card} style={cardStyle}>
        <h2 className="mb-4 text-base font-semibold text-gray-800">Rechercher un coach</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Domaine</label>
            <input
              name="specialite"
              type="text"
              defaultValue={searchParams.specialite ?? ""}
              placeholder="Ex. coach sportif, coach mental..."
              className="w-64 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
              list="domaines-list"
            />
            <datalist id="domaines-list">
              <option value="Coach sportif" />
              <option value="Coach en finance" />
              <option value="Coach en développement personnel" />
              <option value="Coach marketing" />
              <option value="Coach en développement business" />
              <option value="Coach mental" />
              <option value="Coach en séduction" />
              <option value="Coach en bien être et santé" />
              <option value="Coach en langue" />
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Ville</label>
            <input
              name="ville"
              type="text"
              defaultValue={searchParams.ville}
              placeholder="Ex. Lyon"
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tarif max (€/h)</label>
            <input
              name="tarif_max"
              type="number"
              min={0}
              defaultValue={searchParams.tarif_max}
              className="w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Résultats */}
      <div className="space-y-3">
        {(!coaches || coaches.length === 0) && (
          <div className={`${card} text-center text-sm text-gray-500`} style={cardStyle}>
            Aucun coach ne correspond à ces critères.
          </div>
        )}

        {coaches?.map((coach) => {
          const nom = coach.profiles as unknown as { nom: string } | { nom: string }[] | null;
          const nomCoach = Array.isArray(nom) ? nom[0]?.nom : nom?.nom;
          return (
            <Link
              key={coach.id}
              href={`/coachs/${coach.id}`}
              className="flex items-center gap-4 rounded-2xl p-4 shadow-sm transition hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl">
                {coach.photo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={coach.photo_url} alt={nomCoach ?? ""} className="h-full w-full object-cover" />
                  : "👤"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{nomCoach}</p>
                <p className="text-sm text-gray-500">{coach.specialite} · {coach.ville}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-700">{coach.tarif_horaire} €</p>
                <p className="text-xs text-gray-400">/ heure</p>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          {page > 1 ? (
            <Link href={buildPageHref(page - 1)} className="rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white">← Précédent</Link>
          ) : <span />}
          <span className="text-sm text-white/80">Page {page} sur {totalPages}</span>
          {page < totalPages ? (
            <Link href={buildPageHref(page + 1)} className="rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white">Suivant →</Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}
