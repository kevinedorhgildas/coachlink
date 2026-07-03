import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FavoriButton from "@/components/FavoriButton";

const PAR_PAGE = 10;

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

  const { data: favoris } = await supabase
    .from("favoris")
    .select("coach_id")
    .eq("client_id", userData.user.id);
  const favoriIds = new Set((favoris ?? []).map((f) => f.coach_id));
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Trouver un coach</h1>
        <p className="mt-1 text-sm text-gray-500">Recherchez parmi nos coachs par domaine, ville ou tarif.</p>
      </div>

      {reservations && reservations.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Mes réservations en cours</h2>
          <ul className="space-y-2">
            {reservations.slice(0, 3).map((r) => {
              const coachData = r.coaches as unknown as { id: string; profiles: { nom: string } | { nom: string }[] | null } | { id: string; profiles: { nom: string } | { nom: string }[] | null }[] | null;
              const coachObj = Array.isArray(coachData) ? coachData[0] : coachData;
              const coachProfile = Array.isArray(coachObj?.profiles) ? coachObj?.profiles[0] : coachObj?.profiles;
              const dispoData = r.disponibilites as unknown as { jour_semaine: string; heure_debut: string; heure_fin: string } | { jour_semaine: string; heure_debut: string; heure_fin: string }[] | null;
              const dispo = Array.isArray(dispoData) ? dispoData[0] : dispoData;
              const badges: Record<string, string> = { en_attente: "bg-amber-50 text-amber-700", confirmee: "bg-emerald-50 text-emerald-700", refusee: "bg-red-50 text-red-700" };
              const labels: Record<string, string> = { en_attente: "En attente", confirmee: "Confirmée", refusee: "Refusée" };
              return (
                <li key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{coachObj && <Link href={`/coachs/${coachObj.id}`} className="hover:underline">{coachProfile?.nom}</Link>}</p>
                    <p className="text-xs text-gray-500">{new Date(r.date_souhaitee).toLocaleDateString("fr-FR")}{dispo && <span> · {dispo.heure_debut.slice(0, 5)}–{dispo.heure_fin.slice(0, 5)}</span>}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badges[r.statut]}`}>{labels[r.statut]}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <form className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Domaine du coach</label>
            <input name="specialite" type="text" defaultValue={searchParams.specialite ?? ""} placeholder="Ex. coach sportif, coach mental..." className="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" list="domaines-list" />
            <datalist id="domaines-list">
              <option value="Coach sportif" /><option value="Coach en finance" /><option value="Coach en développement personnel" />
              <option value="Coach marketing" /><option value="Coach en développement business" /><option value="Coach mental" />
              <option value="Coach en séduction" /><option value="Coach en bien être et santé" /><option value="Coach en langue" />
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Ville</label>
            <input name="ville" type="text" defaultValue={searchParams.ville} placeholder="Ex. Lyon" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Tarif max (€/h)</label>
            <input name="tarif_max" type="number" min={0} defaultValue={searchParams.tarif_max} className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Rechercher</button>
        </div>
      </form>

      <div className="space-y-3">
        {(!coaches || coaches.length === 0) && <p className="text-sm text-gray-500">Aucun coach ne correspond à ces critères.</p>}
        {coaches?.map((coach) => {
          const nom = coach.profiles as unknown as { nom: string } | { nom: string }[] | null;
          const nomCoach = Array.isArray(nom) ? nom[0]?.nom : nom?.nom;
          return (
            <Link key={coach.id} href={`/coachs/${coach.id}`} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-300">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                {coach.photo_url ? <img src={coach.photo_url} alt={nomCoach ?? ""} className="h-full w-full object-cover" /> : <span className="text-gray-300 text-xl">👤</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{nomCoach}</p>
                  <FavoriButton coachId={coach.id} isFavori={favoriIds.has(coach.id)} />
                </div>
                <p className="text-sm text-gray-500">{coach.specialite} · {coach.ville}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-indigo-600">{coach.tarif_horaire} €/h</p>
                <span className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">
                  Voir le profil →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? <Link href={buildPageHref(page - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400">← Précédent</Link> : <span />}
          <span className="text-sm text-gray-500">Page {page} sur {totalPages}</span>
          {page < totalPages ? <Link href={buildPageHref(page + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400">Suivant →</Link> : <span />}
        </div>
      )}
    </div>
  );
}
