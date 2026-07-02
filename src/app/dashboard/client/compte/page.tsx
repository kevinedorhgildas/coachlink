import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CompteClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, email, created_at")
    .eq("id", userData.user.id)
    .single();

  const { data: client } = await supabase
    .from("clients")
    .select("ville")
    .eq("id", userData.user.id)
    .single();

  const { count: nbReservations } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("client_id", userData.user.id);

  const { count: nbCoachsDifferents } = await supabase
    .from("reservations")
    .select("coach_id", { count: "exact", head: true })
    .eq("client_id", userData.user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mon compte CoachLink</h1>
        <p className="mt-1 text-sm text-gray-500">Informations de votre compte.</p>
      </div>

      {/* Carte profil */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
            {profile?.nom?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile?.nom}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {client?.ville && <p className="text-sm text-gray-400">{client.ville}</p>}
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "–"}
        </p>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{nbReservations ?? 0}</p>
          <p className="mt-1 text-xs text-gray-500">Réservations au total</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{nbCoachsDifferents ?? 0}</p>
          <p className="mt-1 text-xs text-gray-500">Coachs consultés</p>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
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
