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
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col md:flex">
        {/* Logo / brand */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-6">
          <Link href="/dashboard/client" className="text-xl font-bold text-white tracking-tight">
            CoachLink
          </Link>

          {/* Avatar */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
              {initiale}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profile?.nom}</p>
              <p className="truncate text-xs text-blue-200">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col bg-gradient-to-b from-indigo-800 to-indigo-900 px-3 py-4">
          <div className="space-y-1">
            {NAV.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-white/10 hover:text-white"
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* Déconnexion en bas */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-white/10 hover:text-white"
              >
                <span>🚪</span> Déconnexion
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-800 px-4 py-3 md:hidden">
        <Link href="/dashboard/client" className="text-base font-bold text-white">CoachLink</Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
          {initiale}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white px-2 py-2 md:hidden">
        {NAV.slice(0, 5).map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-indigo-600">
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium leading-tight text-center w-12 truncate">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:overflow-auto">
        <main className="flex-1 px-4 py-8 pt-16 md:px-8 md:pt-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
