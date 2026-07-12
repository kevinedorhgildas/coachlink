import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import SpaceSelector from "@/components/SpaceSelector";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/dashboard/client", label: "Trouver un coach", icon: "🔍" },
  { href: "/dashboard/client/reservations", label: "Cours à réserver", icon: "📌" },
  { href: "/dashboard/client/historique", label: "Historique de cours", icon: "📋" },
  { href: "/dashboard/client/achats", label: "Historique d'achats", icon: "🧾" },
  { href: "/dashboard/client/packs", label: "Mes packs", icon: "📦" },
  { href: "/dashboard/client/paiement", label: "Méthodes de paiement", icon: "💳" },
  { href: "/dashboard/client/feed", label: "Fil d'actualité", icon: "📰" },
  { href: "/dashboard/client/messages", label: "Messages", icon: "💬" },
  { href: "/dashboard/client/groupes", label: "Groupes", icon: "👥" },
  { href: "/dashboard/client/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/client/favoris", label: "Mes favoris", icon: "⭐" },
  { href: "/dashboard/client/planning", label: "Mon planning", icon: "📅" },
  { href: "/dashboard/client/compte", label: "Mon compte", icon: "👤" },
];

const SIDEBAR_BG = "linear-gradient(180deg, #0B1120 0%, #111827 100%)";
const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8D5A3";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  // Auto-créer l'enregistrement client si l'utilisateur vient du dashboard coach
  await supabase.from("clients").upsert({
    id: userData.user.id,
    ville: "",
  }, { onConflict: "id", ignoreDuplicates: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, email, role")
    .eq("id", userData.user.id)
    .single();

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";
  const prenom = profile?.nom?.split(" ")[0];

  return (
    <div className="flex min-h-screen" style={{ background: "#F5F2ED" }}>

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden w-64 shrink-0 flex-col md:flex" style={{ background: SIDEBAR_BG }}>

        {/* Logo + profil */}
        <div className="px-6 py-7 border-b" style={{ borderColor: "#ffffff0f" }}>
          <Link href="/dashboard/client"><Logo size="sm" theme="dark" /></Link>
          <div className="mt-6 flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#0B1120" }}
            >
              {initiale}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profile?.nom}</p>
              <p className="truncate text-xs" style={{ color: GOLD + "99" }}>{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col px-3 py-4">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-white/8 hover:text-white"
                  style={{ color: "#ffffff70" }}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t pt-3" style={{ borderColor: "#ffffff0f" }}>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
                style={{ color: "#ffffff40" }}
              >
                <span>🚪</span> Déconnexion
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className="fixed left-0 right-0 top-0 z-10 px-4 py-3 md:hidden" style={{ background: "#0B1120" }}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard/client"><Logo size="sm" theme="dark" /></Link>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#0B1120" }}
          >
            {initiale}
          </div>
        </div>
        <p className="mt-0.5 text-sm font-medium" style={{ color: GOLD }}>Bonjour, {prenom} 👋</p>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white px-1 py-2 md:hidden">
        {NAV.slice(0, 5).map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-amber-600 transition">
            <span className="text-xl">{icon}</span>
            <span className="w-12 truncate text-center text-[10px] font-medium">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* ── MAIN ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
          <p className="text-lg font-bold text-gray-900">Bonjour, {prenom} 👋</p>
          <SpaceSelector current="client" role={profile?.role ?? "client"} />
        </div>
        <main className="flex-1 px-4 pb-24 pt-24 md:px-8 md:pb-8 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
