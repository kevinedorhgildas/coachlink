import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const GOLD = "#C9A96E";

export default async function ClientPacksPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: achats } = await supabase
    .from("achats_packs")
    .select("id, nb_seances_restantes, date_achat, statut, packs_seances(nom, description, nb_seances, prix, coaches(id, profiles(nom)))")
    .eq("client_id", userData.user.id)
    .order("date_achat", { ascending: false });

  const actifs = achats?.filter((a) => a.statut === "actif") ?? [];
  const epuises = achats?.filter((a) => a.statut !== "actif") ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes packs de séances</h1>
        <p className="mt-1 text-sm text-gray-500">Retrouvez vos packs achetés et le nombre de séances restantes.</p>
      </div>

      {(!achats || achats.length === 0) ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-3xl mb-3">📦</p>
          <p className="text-sm font-medium text-gray-500">Vous n'avez pas encore acheté de pack.</p>
          <Link href="/dashboard/client" className="mt-3 inline-block rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Packs actifs */}
          {actifs.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Packs actifs</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {actifs.map((achat) => {
                  const pack = Array.isArray(achat.packs_seances) ? achat.packs_seances[0] : achat.packs_seances as { nom: string; description: string | null; nb_seances: number; prix: number; coaches: unknown } | null;
                  const coachData = pack ? (Array.isArray((pack as Record<string,unknown>).coaches) ? ((pack as Record<string,unknown>).coaches as {id:string;profiles:{nom:string}|{nom:string}[]}[])[0] : (pack as Record<string,unknown>).coaches as {id:string;profiles:{nom:string}|{nom:string}[]|null}|null) : null;
                  const coachProfile = coachData ? (Array.isArray(coachData.profiles) ? coachData.profiles[0] : coachData.profiles as {nom:string}|null) : null;
                  const pct = pack ? Math.round((achat.nb_seances_restantes / pack.nb_seances) * 100) : 0;

                  return (
                    <div key={achat.id} className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: `${GOLD}44` }}>
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{pack?.nom ?? "Pack"}</h3>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "#f0fdf4", color: "#166534" }}>Actif</span>
                      </div>
                      {coachProfile && (
                        <Link href={`/coachs/${coachData?.id}`} className="text-xs hover:underline" style={{ color: GOLD }}>
                          Avec {coachProfile.nom}
                        </Link>
                      )}
                      {pack?.description && <p className="mt-2 text-xs text-gray-400">{pack.description}</p>}

                      {/* Barre de progression */}
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-gray-700">{achat.nb_seances_restantes} séance{achat.nb_seances_restantes > 1 ? "s" : ""} restante{achat.nb_seances_restantes > 1 ? "s" : ""}</span>
                          <span className="text-gray-400">sur {pack?.nb_seances}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)` }} />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-gray-400">Acheté le {new Date(achat.date_achat).toLocaleDateString("fr-FR")}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Packs épuisés */}
          {epuises.length > 0 && (
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">Packs terminés</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {epuises.map((achat) => {
                  const pack = Array.isArray(achat.packs_seances) ? achat.packs_seances[0] : achat.packs_seances as { nom: string; nb_seances: number; coaches: unknown } | null;
                  return (
                    <div key={achat.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 opacity-60">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-700">{pack?.nom ?? "Pack"}</h3>
                        <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-500">Épuisé</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{pack?.nb_seances} séances · Acheté le {new Date(achat.date_achat).toLocaleDateString("fr-FR")}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
