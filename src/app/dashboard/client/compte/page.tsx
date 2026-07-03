import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

const cardStyle = { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" };

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

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Mon compte</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Gérez votre profil CoachLink.</p>
      </div>

      {/* Profil */}
      <div className="rounded-2xl p-5 shadow-sm" style={cardStyle}>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            {initiale}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile?.nom}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {client?.ville && <p className="text-xs text-gray-400 mt-0.5">📍 {client.ville}</p>}
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
          Membre depuis le {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "–"}
        </p>
      </div>

      {/* Stat */}
      <div className="rounded-2xl p-5 text-center shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
        <p className="text-4xl font-bold text-white">{nbReservations ?? 0}</p>
        <p className="mt-1 text-sm text-white/70">Réservations au total</p>
      </div>

      {/* Liens */}
      <div className="rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100" style={cardStyle}>
        {[
          { href: "/faq", icon: "❓", label: "Foire aux questions" },
          { href: "/support", icon: "💬", label: "Contacter le support" },
          { href: "/cgu", icon: "📄", label: "Conditions générales" },
          { href: "/confidentialite", icon: "🔒", label: "Politique de confidentialité" },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-purple-50/40 transition-colors">
            <span className="flex items-center gap-3"><span>{icon}</span>{label}</span>
            <span className="text-gray-300">→</span>
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors">
            <span>🚪</span> Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
