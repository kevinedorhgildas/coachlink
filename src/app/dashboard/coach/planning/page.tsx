import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlanningView, { Evenement } from "@/components/planning/PlanningView";
import { Suspense } from "react";

export default async function CoachPlanningPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, disponibilites(heure_debut, heure_fin), profiles!reservations_client_id_fkey(nom)")
    .eq("coach_id", userData.user.id)
    .order("date_souhaitee", { ascending: true });

  const evenements: Evenement[] = (reservations ?? []).map((r) => {
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
    const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string } | null;
    return {
      id: r.id,
      date: r.date_souhaitee,
      heureDebut: dispo?.heure_debut?.slice(0, 5) ?? "–",
      heureFin: dispo?.heure_fin?.slice(0, 5) ?? "–",
      titre: clientProfile?.nom ?? "Client",
      statut: r.statut,
      coachId: userData.user!.id,
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon planning</h1>
        <Link href="/dashboard/coach" className="text-sm text-blue-600 hover:underline">
          ← Tableau de bord
        </Link>
      </div>
      <Suspense>
        <PlanningView evenements={evenements} baseUrl="/dashboard/coach/planning" />
      </Suspense>
    </main>
  );
}
