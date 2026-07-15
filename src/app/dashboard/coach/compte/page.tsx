import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import EditProfilCoach from "./EditProfilCoach";

const GOLD = "#C9A96E";

export default async function CompteCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const [{ data: profile }, { data: coach }] = await Promise.all([
    supabase.from("profiles").select("nom, email, created_at").eq("id", userData.user.id).single(),
    supabase.from("coaches").select("specialite, ville, tarif_horaire, photo_url, description").eq("id", userData.user.id).single(),
  ]);

  const [{ count: nbClients }, { count: nbCoursTotal }] = await Promise.all([
    supabase.from("reservations").select("client_id", { count: "exact", head: true }).eq("coach_id", userData.user.id),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("coach_id", userData.user.id).eq("statut", "confirmee"),
  ]);

  const initiale = profile?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mon compte</h1>
        <p className="mt-1 text-sm text-gray-500">Informations et statistiques de votre compte.</p>
      </div>

      {/* Profil */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full" style={{ outline: `2px solid ${GOLD}44` }}>
            {coach?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                {initiale}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile?.nom}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">{coach?.specialite}{coach?.ville ? ` · ${coach.ville}` : ""}{coach?.tarif_horaire ? ` · ${coach.tarif_horaire} €/h` : ""}</p>
          </div>
        </div>
        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
          Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "–"}
        </p>
        <div className="mt-4">
          <EditProfilCoach
            nom={profile?.nom ?? ""}
            ville={coach?.ville ?? ""}
            specialite={coach?.specialite ?? ""}
            tarif_horaire={coach?.tarif_horaire ?? 0}
            description={(coach as Record<string,unknown>)?.description as string ?? ""}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { value: nbCoursTotal ?? 0, label: "Cours confirmés" },
          { value: nbClients ?? 0, label: "Clients au total" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-2xl border p-4 text-center shadow-sm" style={{ borderColor: `${GOLD}44`, background: `${GOLD}0a` }}>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-xs font-medium" style={{ color: GOLD }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Liens */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        <Link href={`/coachs/${userData.user.id}`} className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 transition hover:bg-gray-50">
          <span className="flex items-center gap-3"><span>🌐</span> Voir mon profil public</span>
          <span className="text-gray-300 text-xs">→</span>
        </Link>
        {[
          { href: "/faq", icon: "❓", label: "Foire aux questions" },
          { href: "/support", icon: "💬", label: "Contacter le support" },
          { href: "/cgu", icon: "📄", label: "Conditions générales" },
          { href: "/confidentialite", icon: "🔒", label: "Politique de confidentialité" },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 transition hover:bg-gray-50">
            <span className="flex items-center gap-3"><span>{icon}</span>{label}</span>
            <span className="text-gray-300 text-xs">→</span>
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm text-red-500 transition hover:bg-red-50">
            <span>🚪</span> Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
