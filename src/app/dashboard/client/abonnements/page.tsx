import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

export default async function AbonnementsClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: abonnements } = await supabase
    .from("abonnements")
    .select("coach_id, coaches(id, specialite, ville, tarif_horaire, photo_url, profiles(nom))")
    .eq("client_id", userData.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Coachs suivis</h1>
        <p className="mt-1 text-sm text-gray-500">
          {abonnements && abonnements.length > 0
            ? `Vous suivez ${abonnements.length} coach${abonnements.length > 1 ? "s" : ""}.`
            : "Les coachs auxquels vous êtes abonné apparaîtront ici."}
        </p>
      </div>

      {!abonnements || abonnements.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 h-0.5 w-12 rounded-full" style={{ background: `${GOLD}44` }} />
          <p className="font-medium text-gray-700">Vous ne suivez encore aucun coach.</p>
          <p className="mt-1 text-sm text-gray-400">Cliquez sur "S'abonner" sur le profil d'un coach pour le suivre.</p>
          <Link
            href="/coachs"
            className="mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
          >
            Découvrir les coachs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {abonnements.map((a) => {
            const coach = Array.isArray(a.coaches) ? a.coaches[0] : a.coaches as {
              id: string; specialite: string; ville: string;
              tarif_horaire: number; photo_url: string | null;
              profiles: { nom: string } | { nom: string }[] | null;
            } | null;
            if (!coach) return null;
            const nom = Array.isArray(coach.profiles)
              ? coach.profiles[0]?.nom
              : (coach.profiles as { nom: string } | null)?.nom;
            return (
              <Link
                key={a.coach_id}
                href={`/coachs/${coach.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-transparent hover:shadow-md"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                  {coach.photo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={coach.photo_url} alt={nom ?? ""} className="h-full w-full object-cover" />
                    : <span className="text-sm font-bold text-gray-400">{nom?.charAt(0).toUpperCase() ?? "?"}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{nom}</p>
                  <p className="text-sm text-gray-400 truncate">{coach.specialite}{coach.ville ? ` · ${coach.ville}` : ""}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{coach.tarif_horaire} €</p>
                    <p className="text-xs text-gray-400">/ heure</p>
                  </div>
                  <span
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition group-hover:border-transparent group-hover:shadow-sm"
                    style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}
                  >
                    Voir le profil →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
