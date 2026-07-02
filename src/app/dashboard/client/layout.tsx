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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        {/* Logo */}
        <div className="border-b border-gray-100 px-5 py-5">
          <Link href="/dashboard/client" className="text-lg font-bold text-gray-900">
            CoachLink
          </Link>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
            {initiale}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{profile?.nom}</p>
            <p className="truncate text-xs text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col px-3 py-3">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-gray-100 pt-3">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
              >
                <span>🚪</span> Déconnexion
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Link href="/dashboard/client" className="text-base font-bold text-gray-900">CoachLink</Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
          {initiale}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white px-1 py-2 md:hidden">
        {NAV.slice(0, 5).map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-blue-600">
            <span className="text-xl">{icon}</span>
            <span className="w-12 truncate text-center text-[10px] font-medium">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Contenu */}
      <main className="flex-1 px-4 pb-24 pt-16 md:px-8 md:pb-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
