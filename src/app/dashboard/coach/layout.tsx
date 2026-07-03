import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

const NAV = [
  { href: "/dashboard/coach", label: "Mon profil", icon: "✏️" },
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

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, email")
    .eq("id", userData.user.id)
    .single();

  const { data: coach } = await supabase
    .from("coaches")
    .select("photo_url, specialite")
    .eq("id", userData.user.id)
    .single();

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col md:flex">
        {/* Header sidebar */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-6">
          <Link href="/dashboard/coach" className="text-xl font-bold text-white tracking-tight">
            CoachLink
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/20">
              {coach?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                  {initiale}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profile?.nom}</p>
              <p className="truncate text-xs text-emerald-200">{coach?.specialite ?? "Coach"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col bg-gradient-to-b from-teal-700 to-teal-900 px-3 py-4">
          <div className="space-y-0.5">
            {NAV.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-teal-100 transition hover:bg-white/10 hover:text-white"
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-0.5 border-t border-white/10 pt-4">
            <Link
              href={`/coachs/${userData.user.id}`}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-teal-200 transition hover:bg-white/10 hover:text-white"
            >
              <span>🌐</span> Mon profil public
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-teal-300 transition hover:bg-white/10 hover:text-white"
              >
                <span>🚪</span> Déconnexion
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/coach" className="text-base font-bold text-white">CoachLink</Link>
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/20">
            {coach?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">{initiale}</div>
            )}
          </div>
        </div>
        <p className="mt-0.5 text-sm font-medium text-white/90">Bonjour, {profile?.nom?.split(" ")[0]} 👋</p>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white px-2 py-2 md:hidden">
        {NAV.slice(0, 5).map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-teal-600">
            <span className="text-xl">{icon}</span>
            <span className="w-12 truncate text-center text-[10px] font-medium leading-tight">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <div className="hidden md:block border-b border-gray-200 bg-white px-8 py-4">
          <p className="text-lg font-bold text-gray-900">Bonjour, {profile?.nom?.split(" ")[0]} 👋</p>
        </div>
        <main className="flex-1 px-4 pb-24 pt-24 md:px-8 md:pb-8 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
