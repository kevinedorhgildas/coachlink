import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function CompteClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from("profiles").select("nom, email, created_at").eq("id", userData.user.id).single(),
    supabase.from("clients").select("ville").eq("id", userData.user.id).single(),
  ]);

  const { count: nbReservations } = await supabase
    .from("reservations").select("id", { count: "exact", head: true }).eq("client_id", userData.user.id);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mon compte CoachLink</h1>
      </div>

      {/* Profil */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">
            {profile?.nom?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.nom}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {client?.ville && <p className="text-sm text-gray-400">{client.ville}</p>}
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
          Membre depuis le {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "–"}
        </p>
      </div>

      {/* Stat */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-center">
        <p className="text-2xl font-bold text-blue-600">{nbReservations ?? 0}</p>
        <p className="mt-0.5 text-xs text-gray-500">Réservations au total</p>
      </div>

      {/* Liens */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {[
          { href: "/faq", icon: "❓", label: "Foire aux questions" },
          { href: "/support", icon: "💬", label: "Contacter le support" },
          { href: "/cgu", icon: "📄", label: "Conditions générales" },
          { href: "/confidentialite", icon: "🔒", label: "Politique de confidentialité" },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
            <span className="flex items-center gap-3"><span>{icon}</span>{label}</span>
            <span className="text-gray-300">→</span>
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm text-red-500 hover:bg-red-50">
            <span>🚪</span> Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
