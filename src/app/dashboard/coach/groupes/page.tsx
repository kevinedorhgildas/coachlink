import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateGroupeForm from "./CreateGroupeForm";
import PlanGate from "@/components/PlanGate";
import { canAccess } from "@/lib/plans";

const GOLD = "#C9A96E";

export default async function GroupesCoachPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: coachPlan } = await supabase.from("coaches").select("abonnement").eq("id", userData.user.id).single();
  const plan = ((coachPlan as Record<string,unknown>)?.abonnement as string) ?? "gratuit";
  if (!canAccess(plan as Parameters<typeof canAccess>[0], "groupes")) return <PlanGate feature="Groupes de discussion" plan="pro" />;

  const { data: groupes } = await supabase
    .from("groupes_discussion")
    .select("id, nom, description, created_at")
    .eq("coach_id", userData.user.id)
    .order("created_at", { ascending: false });

  // Nb membres + dernier message par groupe
  const groupesAvecStats = await Promise.all(
    (groupes ?? []).map(async (g) => {
      const [{ count: nbMembres }, { data: dernierMsg }] = await Promise.all([
        supabase.from("groupe_membres").select("id", { count: "exact", head: true }).eq("groupe_id", g.id),
        supabase.from("groupe_messages").select("contenu, created_at").eq("groupe_id", g.id).order("created_at", { ascending: false }).limit(1),
      ]);
      return { ...g, nbMembres: (nbMembres ?? 1) - 1, dernierMsg: dernierMsg?.[0] ?? null };
    })
  );

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groupes de discussion</h1>
          <p className="mt-1 text-sm text-gray-500">Communiquez avec plusieurs clients en même temps.</p>
        </div>
      </div>

      <CreateGroupeForm />

      <div className="mt-8 space-y-3">
        {groupesAvecStats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-sm font-medium text-gray-500">Aucun groupe créé.</p>
            <p className="text-xs text-gray-400 mt-1">Créez un groupe pour échanger avec plusieurs clients à la fois.</p>
          </div>
        ) : (
          groupesAvecStats.map((g) => (
            <Link key={g.id} href={`/dashboard/coach/groupes/${g.id}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#C9A96E44] hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: `${GOLD}22` }}>
                  💬
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{g.nom}</p>
                  {g.description && <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>}
                  {g.dernierMsg && (
                    <p className="mt-1 text-xs text-gray-400 truncate max-w-xs">
                      {g.dernierMsg.contenu}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>
                  {g.nbMembres} client{g.nbMembres > 1 ? "s" : ""}
                </span>
                <p className="mt-1 text-[10px] text-gray-400">→</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
