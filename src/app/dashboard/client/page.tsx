import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAR_PAGE = 10;

export default async function DashboardClientPage({
  searchParams,
}: {
  searchParams: { specialite?: string; ville?: string; tarif_max?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom")
    .eq("id", userData.user.id)
    .single();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PAR_PAGE;
  const to = from + PAR_PAGE - 1;

  let query = supabase
    .from("coaches")
    .select("id, specialite, ville, tarif_horaire, photo_url, profiles(nom)", { count: "exact" });

  if (searchParams.specialite) {
    query = query.ilike("specialite", `%${searchParams.specialite}%`);
  }
  if (searchParams.ville) {
    query = query.ilike("ville", `%${searchParams.ville}%`);
  }
  if (searchParams.tarif_max) {
    query = query.lte("tarif_horaire", Number(searchParams.tarif_max));
  }

  const { data: coaches, count } = await query
    .order("tarif_horaire", { ascending: true })
    .range(from, to);

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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Trouver un coach</h1>
        <p className="mt-1 text-sm text-gray-500">Recherchez parmi nos coachs par domaine, ville ou tarif.</p>
      </div>

      <form className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Domaine</label>
          <input
            name="specialite"
            type="text"
            defaultValue={searchParams.specialite ?? ""}
            placeholder="Ex. coach sportif, coach mental..."
            className="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
          <label className="mb-1 block text-xs font-medium text-gray-700">Ville</label>
          <input
            name="ville"
            type="text"
            defaultValue={searchParams.ville}
            placeholder="Ex. Lyon"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Tarif max (€/h)</label>
          <input
            name="tarif_max"
            type="number"
            min={0}
            defaultValue={searchParams.tarif_max}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Rechercher
        </button>
      </form>

      <div className="space-y-3">
        {(!coaches || coaches.length === 0) && (
          <p className="text-sm text-gray-500">Aucun coach ne correspond à ces critères.</p>
        )}

        {coaches?.map((coach) => {
          const nom = (coach.profiles as unknown as { nom: string } | { nom: string }[] | null);
          const nomCoach = Array.isArray(nom) ? nom[0]?.nom : nom?.nom;
          return (
          <Link
            key={coach.id}
            href={`/coachs/${coach.id}`}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
              {coach.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.photo_url} alt={nomCoach ?? ""} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{nomCoach}</p>
              <p className="text-sm text-gray-600">
                {coach.specialite} · {coach.ville}
              </p>
            </div>
            <p className="font-semibold text-blue-600">{coach.tarif_horaire} €/h</p>
          </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <Link
              href={buildPageHref(page - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
            >
              ← Précédent
            </Link>
          ) : (
            <span />
          )}

          <span className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildPageHref(page + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
            >
              Suivant →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
