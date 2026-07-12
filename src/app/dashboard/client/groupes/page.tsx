import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const GOLD = "#C9A96E";

export default async function GroupesClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: memberships } = await supabase
    .from("groupe_membres")
    .select("groupe_id, groupes_discussion(id, nom, description, coach_id, profiles!groupes_discussion_coach_id_fkey(nom))")
    .eq("user_id", userData.user.id);

  const groupes = (memberships ?? [])
    .map((m) => {
      const g = Array.isArray(m.groupes_discussion) ? m.groupes_discussion[0] : m.groupes_discussion as {
        id: string; nom: string; description: string | null; coach_id: string;
        profiles: { nom: string } | { nom: string }[] | null;
      } | null;
      if (!g) return null;
      const coachProfile = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles as { nom: string } | null;
      return { ...g, coachNom: coachProfile?.nom ?? "Coach" };
    })
    .filter(Boolean);

  // Dernier message par groupe
  const groupesAvecMsg = await Promise.all(
    groupes.map(async (g) => {
      if (!g) return null;
      const { data: dernierMsg } = await supabase
        .from("groupe_messages")
        .select("contenu, created_at")
        .eq("groupe_id", g.id)
        .order("created_at", { ascending: false })
        .limit(1);
      return { ...g, dernierMsg: dernierMsg?.[0] ?? null };
    })
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Groupes de discussion</h1>
        <p className="mt-1 text-sm text-gray-500">Les groupes auxquels vous participez.</p>
      </div>

      {groupesAvecMsg.filter(Boolean).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-3xl mb-3">💬</p>
          <p className="text-sm font-medium text-gray-500">Vous n'êtes membre d'aucun groupe.</p>
          <p className="text-xs text-gray-400 mt-1">Votre coach vous ajoutera à un groupe de discussion.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupesAvecMsg.filter(Boolean).map((g) => g && (
            <Link key={g.id} href={`/dashboard/client/groupes/${g.id}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#C9A96E44] hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: `${GOLD}22` }}>
                  💬
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{g.nom}</p>
                  <p className="text-xs mt-0.5" style={{ color: GOLD }}>Avec {g.coachNom}</p>
                  {g.dernierMsg && (
                    <p className="mt-1 text-xs text-gray-400 truncate max-w-xs">{g.dernierMsg.contenu}</p>
                  )}
                </div>
              </div>
              <span className="text-gray-300 shrink-0 ml-4">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
