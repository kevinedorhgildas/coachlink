import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

const NAV = [
  { href: "/dashboard/client", label: "Trouver un coach", icon: "🔍" },
  { href: "/dashboard/client/reservations", label: "Cours à réserver", icon: "📌" },
  { href: "/dashboard/client/historique", label: "Historique de cours", icon: "📋" },
  { href: "/dashboard/client/achats", label: "Historique d'achats", icon: "🧾" },
  { href: "/dashboard/client/paiement", label: "Méthodes de paiement", icon: "💳" },
  { href: "/dashboard/client/planning", label: "Mon planning", icon: "📅" },
  { href: "/dashboard/client/compte", label: "Mon compte", icon: "👤" },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, email")
    .eq("id", userData.user.id)
    .single();

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col md:flex" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.15)" }}>
        {/* Logo */}
        <div className="px-6 py-7 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <Link href="/dashboard/client" className="text-xl font-bold text-white tracking-tight">
            CoachLink
          </Link>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Espace client</p>
        </div>

        {/* Profil */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))", border: "2px solid rgba(255,255,255,0.3)" }}>
            {initiale}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{profile?.nom}</p>
            <p className="truncate text-xs leading-tight" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "140px" }}>{profile?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col px-3 py-4">
          <ul className="space-y-1">
            {NAV.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-white/15 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <span>🚪</span> Déconnexion
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-3 md:hidden" style={{ background: "rgba(102,126,234,0.95)", backdropFilter: "blur(10px)" }}>
        <Link href="/dashboard/client" className="text-base font-bold text-white">CoachLink</Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
          {initiale}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t px-1 py-2 md:hidden" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderColor: "rgba(102,126,234,0.2)" }}>
        {NAV.slice(0, 5).map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-purple-400 hover:text-purple-700">
            <span className="text-xl">{icon}</span>
            <span className="w-12 truncate text-center text-[10px] font-medium">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Contenu */}
      <main className="flex-1 px-4 pb-24 pt-16 md:px-8 md:pb-8 md:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
