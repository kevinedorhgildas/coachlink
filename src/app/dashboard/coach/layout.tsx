import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import SpaceSelector from "./SpaceSelector";

const NAV = [
  { href: "/dashboard/coach", label: "Mon profil", icon: "✏️" },
  { href: "/dashboard/coach/messages", label: "Messages", icon: "💬" },
  { href: "/dashboard/coach/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/coach/cours-a-venir", label: "Cours à venir", icon: "📌" },
  { href: "/dashboard/coach/stats", label: "Cours réalisés", icon: "📊" },
  { href: "/dashboard/coach/historique", label: "Historique de cours", icon: "📋" },
  { href: "/dashboard/coach/ventes", label: "Cours vendus", icon: "🧾" },
  { href: "/dashboard/coach/paiement", label: "Méthodes de paiement", icon: "💳" },
  { href: "/dashboard/coach/planning", label: "Mon planning", icon: "📅" },
  { href: "/dashboard/coach/vitrine", label: "Ma vitrine", icon: "🖼️" },
  { href: "/dashboard/coach/documents", label: "Mes documents", icon: "📄" },
  { href: "/dashboard/coach/compte", label: "Mon compte", icon: "👤" },
];

const SIDEBAR_BG = "linear-gradient(180deg, #0B1120 0%, #111827 100%)";
const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8D5A3";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, email, role")
    .eq("id", userData.user.id)
    .single();

  const { data: coach } = await supabase
    .from("coaches")
    .select("photo_url, specialite")
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
          <Link href="/dashboard/coach" className="text-xl font-bold tracking-tight text-white">
            Coach<span style={{ color: GOLD }}>Link</span>
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full" style={{ outline: `2px solid ${GOLD}44` }}>
              {coach?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#0B1120" }}>
                  {initiale}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profile?.nom}</p>
              <p className="truncate text-xs" style={{ color: GOLD }}>{coach?.specialite ?? "Coach"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col px-3 py-4">
          <div className="space-y-0.5">
            {NAV.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
                style={{ color: "#ffffff80" }}
                onMouseEnter={undefined}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-0.5 border-t pt-4" style={{ borderColor: "#ffffff0f" }}>
            <Link
              href={`/coachs/${userData.user.id}`}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition"
              style={{ color: GOLD }}
            >
              <span>🌐</span> Mon profil public
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition"
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
          <Link href="/dashboard/coach" className="text-base font-bold text-white">
            Coach<span style={{ color: GOLD }}>Link</span>
          </Link>
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
            {coach?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#0B1120" }}>
                {initiale}
              </div>
            )}
          </div>
        </div>
        <p className="mt-0.5 text-sm font-medium" style={{ color: GOLD }}>Bonjour, {prenom} 👋</p>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white px-2 py-2 md:hidden">
        {NAV.slice(0, 5).map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-amber-600 transition">
            <span className="text-xl">{icon}</span>
            <span className="w-12 truncate text-center text-[10px] font-medium leading-tight">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* ── MAIN ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
          <p className="text-lg font-bold text-gray-900">Bonjour, {prenom} 👋</p>
          <SpaceSelector role={profile?.role ?? "coach"} />
        </div>
        <main className="flex-1 px-4 pb-24 pt-24 md:px-8 md:pb-8 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
