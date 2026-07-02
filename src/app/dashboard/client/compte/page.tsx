import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PhotoUploadClient from "./PhotoUploadClient";

export default async function CompteClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from("profiles").select("nom, email, created_at").eq("id", userData.user.id).single(),
    supabase.from("clients").select("ville, photo_url").eq("id", userData.user.id).single(),
  ]);

  const { count: nbReservations } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("client_id", userData.user.id);

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mon compte CoachLink</h1>

      {/* Carte profil + photo */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <PhotoUploadClient photoUrl={client?.photo_url ?? null} initiale={initiale} />
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-base font-semibold text-gray-900">{profile?.nom}</p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          {client?.ville && <p className="text-sm text-gray-400">{client.ville}</p>}
          <p className="mt-2 text-xs text-gray-400">
            Membre depuis le {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
              : "–"}
          </p>
        </div>
      </div>

      {/* Stat */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-blue-600">{nbReservations ?? 0}</p>
        <p className="mt-1 text-xs text-gray-500">Réservations au total</p>
      </div>

      {/* Liens */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
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
    </main>
  );
}
