import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FavoriButton from "@/components/FavoriButton";

export default async function FavorisClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: favoris } = await supabase
    .from("favoris")
    .select("coach_id, coaches(id, specialite, ville, tarif_horaire, photo_url, profiles(nom))")
    .eq("client_id", userData.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mes coachs favoris</h1>
        <p className="mt-1 text-sm text-gray-500">Les coachs que vous avez mis en favori.</p>
      </div>

      {!favoris || favoris.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-2xl mb-3">⭐</p>
          <p className="text-gray-600 font-medium">Aucun favori pour le moment.</p>
          <p className="mt-1 text-sm text-gray-400">Cliquez sur l'étoile ☆ à côté d'un coach pour l'ajouter.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favoris.map((f) => {
            const coach = Array.isArray(f.coaches) ? f.coaches[0] : f.coaches as { id: string; specialite: string; ville: string; tarif_horaire: number; photo_url: string | null; profiles: { nom: string } | { nom: string }[] | null } | null;
            if (!coach) return null;
            const nom = Array.isArray(coach.profiles) ? coach.profiles[0]?.nom : (coach.profiles as { nom: string } | null)?.nom;
            return (
              <div key={f.coach_id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <Link href={`/coachs/${coach.id}`} className="flex flex-1 items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                    {coach.photo_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={coach.photo_url} alt={nom ?? ""} className="h-full w-full object-cover" />
                      : <span className="text-gray-300 text-xl">👤</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{nom}</p>
                    <p className="text-sm text-gray-500">{coach.specialite} · {coach.ville}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-indigo-600">{coach.tarif_horaire} €/h</p>
                    <span className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">
                      Voir le profil →
                    </span>
                  </div>
                </Link>
                <FavoriButton coachId={coach.id} isFavori={true} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
