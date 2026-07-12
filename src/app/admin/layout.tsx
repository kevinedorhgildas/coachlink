import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

const NAV = [
  { href: "/admin/dashboard",  label: "Tableau de bord", icon: "📊" },
  { href: "/admin/coachs",     label: "Coachs",          icon: "🧑‍💼" },
  { href: "/admin/prospects",  label: "Prospects",       icon: "🎯" },
  { href: "/admin/newsletter", label: "Newsletter",      icon: "📧" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen flex" style={{ background: "#FAF8F5", position: "relative", zIndex: 0 }}>
      <style>{`body > footer { display: none !important; }`}</style>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Admin</p>
          <p className="text-lg font-bold text-gray-900">CoachLink</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">← Retour au site</Link>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
