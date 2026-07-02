import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

const NAV = [
  { href: "/dashboard/client", label: "Trouver un coach", icon: "🔍", exact: true },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/dashboard/client" className="text-lg font-bold text-gray-900">
            CoachLink
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-gray-600 sm:block">
              Bonjour, <span className="font-medium">{profile?.nom}</span>
            </p>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-400 hover:text-gray-700">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 sm:block">
          <nav className="space-y-1 rounded-xl border border-gray-200 bg-white p-2">
            {NAV.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:hidden w-full">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
