import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import EditProfilClient from "./EditProfilClient";
import UploadPhotoClient from "./UploadPhotoClient";

const GOLD = "#C9A96E";

export default async function CompteClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from("profiles").select("nom, email, created_at").eq("id", userData.user.id).single(),
    supabase.from("clients").select("ville, photo_url").eq("id", userData.user.id).single(),
  ]);

  const { count: nbReservations } = await supabase
    .from("reservations").select("id", { count: "exact", head: true }).eq("client_id", userData.user.id);

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mon compte</h1>
        <p className="mt-1 text-sm text-gray-500">Vos informations et paramètres.</p>
      </div>

      {/* Profil */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <UploadPhotoClient photoUrl={client?.photo_url ?? undefined} initiale={initiale} />
          <div>
            <p className="font-semibold text-gray-900">{profile?.nom}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {client?.ville && <p className="text-xs text-gray-400 mt-0.5">{client.ville}</p>}
          </div>
        </div>
        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
          Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "–"}
        </p>
        <div className="mt-4">
          <EditProfilClient
            nom={profile?.nom ?? ""}
            ville={client?.ville ?? ""}
          />
        </div>
      </div>

      {/* Stat */}
      <div className="mb-4 rounded-2xl border p-4 text-center shadow-sm" style={{ borderColor: `${GOLD}44`, background: `${GOLD}0a` }}>
        <p className="text-3xl font-bold" style={{ color: "#0B1120" }}>{nbReservations ?? 0}</p>
        <p className="mt-0.5 text-xs font-medium" style={{ color: GOLD }}>Réservations au total</p>
      </div>

      {/* Liens */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {[
          { href: "/faq", label: "Foire aux questions" },
          { href: "/support", label: "Contacter le support" },
          { href: "/cgu", label: "Conditions générales" },
          { href: "/confidentialite", label: "Politique de confidentialité" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 transition hover:bg-gray-50">
            {label}
            <span className="text-gray-300 text-xs">→</span>
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="flex w-full items-center px-5 py-3.5 text-left text-sm text-red-500 transition hover:bg-red-50">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
