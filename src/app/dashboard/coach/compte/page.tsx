import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CompteCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: profile }, { data: coach }] = await Promise.all([
    supabase.from("profiles").select("nom, email, created_at").eq("id", userData.user.id).single(),
    supabase.from("coaches").select("specialite, ville, tarif_horaire, photo_url").eq("id", userData.user.id).single(),
  ]);

  const [{ count: nbClients }, { count: nbCoursTotal }] = await Promise.all([
    supabase.from("reservations").select("client_id", { count: "exact", head: true }).eq("coach_id", userData.user.id),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("coach_id", userData.user.id).eq("statut", "confirmee"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mon compte CoachLink</h1>
        <p className="mt-1 text-sm text-gray-500">Informations et statistiques de votre compte.</p>
      </div>

      {/* Carte profil */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-teal-100 bg-teal-50">
            {coach?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-teal-600">
                {profile?.nom?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile?.nom}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <p className="text-sm text-gray-400">{coach?.specialite}{coach?.ville ? ` · ${coach.ville}` : ""}{coach?.tarif_horaire ? ` · ${coach.tarif_horaire} €/h` : ""}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "–"}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-teal-600">{nbCoursTotal ?? 0}</p>
          <p className="mt-1 text-xs text-gray-500">Cours confirmés</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-teal-600">{nbClients ?? 0}</p>
          <p className="mt-1 text-xs text-gray-500">Clients au total</p>
        </div>
      </div>

      {/* Liens */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        <Link href={`/coachs/${userData.user.id}`} className="flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50">
          <span className="flex items-center gap-3"><span>🌐</span> Voir mon profil public</span>
          <span className="text-gray-300">→</span>
        </Link>
        <Link href="/faq" className="flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50">
          <span className="flex items-center gap-3"><span>❓</span> Foire aux questions</span>
          <span className="text-gray-300">→</span>
        </Link>
        <Link href="/support" className="flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50">
          <span className="flex items-center gap-3"><span>💬</span> Contacter le support</span>
          <span className="text-gray-300">→</span>
        </Link>
        <Link href="/cgu" className="flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50">
          <span className="flex items-center gap-3"><span>📄</span> Conditions générales</span>
          <span className="text-gray-300">→</span>
        </Link>
        <Link href="/confidentialite" className="flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-50">
          <span className="flex items-center gap-3"><span>🔒</span> Politique de confidentialité</span>
          <span className="text-gray-300">→</span>
        </Link>
      </div>
    </div>
  );
}
