import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlanningView, { Evenement } from "@/components/planning/PlanningView";
import { Suspense } from "react";

export default async function ClientPlanningPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, disponibilites(heure_debut, heure_fin), coaches(id, profiles(nom))")
    .eq("client_id", userData.user.id)
    .order("date_souhaitee", { ascending: true });

  const evenements: Evenement[] = (reservations ?? []).map((r) => {
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
    const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; profiles: { nom: string } | { nom: string }[] | null } | null;
    const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
    return {
      id: r.id,
      date: r.date_souhaitee,
      heureDebut: dispo?.heure_debut?.slice(0, 5) ?? "–",
      heureFin: dispo?.heure_fin?.slice(0, 5) ?? "–",
      titre: coachProfile?.nom ?? "Coach",
      statut: r.statut,
      coachId: coachData?.id,
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon planning</h1>
        <Link href="/dashboard/client" className="text-sm text-blue-600 hover:underline">
          ← Tableau de bord
        </Link>
      </div>
      <Suspense>
        <PlanningView evenements={evenements} baseUrl="/dashboard/client/planning" />
      </Suspense>
    </main>
  );
}
