import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const cardStyle = { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" };

export default async function AchatsClientPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const today = new Date().toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, coaches(id, specialite, tarif_horaire, profiles(nom)), disponibilites(heure_debut, heure_fin)")
    .eq("client_id", userData.user.id)
    .eq("statut", "confirmee")
    .lt("date_souhaitee", today)
    .order("date_souhaitee", { ascending: false });

  const total = reservations?.reduce((sum, r) => {
    const c = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { tarif_horaire: number } | null;
    return sum + (c?.tarif_horaire ?? 0);
  }, 0) ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historique d'achats</h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Vos séances confirmées et effectuées.</p>
        </div>
        {(reservations?.length ?? 0) > 0 && (
          <div className="rounded-2xl px-5 py-3 text-right shadow-sm" style={cardStyle}>
            <p className="text-xs text-gray-400">Total dépensé</p>
            <p className="text-2xl font-bold text-purple-700">{total} €</p>
          </div>
        )}
      </div>

      {!reservations || reservations.length === 0 ? (
        <div className="rounded-2xl p-10 text-center shadow-sm" style={cardStyle}>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: "linear-gradient(135deg, #667eea22, #764ba222)" }}>🧾</div>
          <p className="text-gray-600 font-medium">Aucun achat pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={cardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Coach</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Horaire</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map((r) => {
                const c = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; specialite: string; tarif_horaire: number; profiles: { nom: string } | { nom: string }[] | null } | null;
                const p = Array.isArray(c?.profiles) ? c?.profiles[0] : c?.profiles as { nom: string } | null;
                const d = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
                return (
                  <tr key={r.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/coachs/${c?.id}`} className="font-medium text-gray-900 hover:underline">{p?.nom ?? "–"}</Link>
                      <p className="text-xs text-gray-400">{c?.specialite}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-3.5 text-gray-600">{d ? `${d.heure_debut.slice(0, 5)} – ${d.heure_fin.slice(0, 5)}` : "–"}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{c?.tarif_horaire ?? "–"} €</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50/80">
                <td colSpan={3} className="px-5 py-3 text-right text-sm font-semibold text-gray-600">Total</td>
                <td className="px-5 py-3 text-right font-bold text-purple-700 text-base">{total} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
