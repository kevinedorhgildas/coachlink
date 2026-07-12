import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentsManager from "./DocumentsManager";
import PlanGate from "@/components/PlanGate";
import { canAccess } from "@/lib/plans";

export default async function CoachDocumentsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: coachPlan } = await supabase.from("coaches").select("abonnement").eq("id", userData.user.id).single();
  const plan = ((coachPlan as Record<string,unknown>)?.abonnement as string) ?? "gratuit";
  if (!canAccess(plan as Parameters<typeof canAccess>[0], "documents")) return <PlanGate feature="Documents clients" plan="pro" />;

  const { data: documents } = await supabase
    .from("documents")
    .select("id, nom, url, created_at")
    .eq("coach_id", userData.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mes documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Programmes, cours et ressources visibles sur votre profil public.
        </p>
      </div>
      <DocumentsManager documents={documents ?? []} />
    </div>
  );
}
