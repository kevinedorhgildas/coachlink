import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PacksManager from "./PacksManager";

const GOLD = "#C9A96E";

export default async function PacksPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: packs } = await supabase
    .from("packs_seances")
    .select("id, nom, description, nb_seances, prix, actif")
    .eq("coach_id", userData.user.id)
    .order("created_at", { ascending: false });

  const actifs = packs?.filter((p) => p.actif).length ?? 0;
  const total = packs?.length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Packs de séances</h1>
        <p className="mt-1 text-sm text-gray-500">Proposez des lots de séances à tarif préférentiel à vos clients.</p>
      </div>

      {/* Stats rapides */}
      {total > 0 && (
        <div className="mb-6 flex gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-400">Pack{total > 1 ? "s" : ""} créé{total > 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm" style={{ borderColor: `${GOLD}44` }}>
            <p className="text-2xl font-bold" style={{ color: GOLD }}>{actifs}</p>
            <p className="text-xs text-gray-400">Actif{actifs > 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      <PacksManager packs={packs ?? []} />
    </div>
  );
}
