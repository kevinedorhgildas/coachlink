import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DocumentsManager from "./DocumentsManager";

export default async function CoachDocumentsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: documents } = await supabase
    .from("documents")
    .select("id, nom, url, created_at")
    .eq("coach_id", userData.user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Programmes, cours et ressources visibles sur votre profil public.
          </p>
        </div>
        <Link href="/dashboard/coach" className="text-sm text-blue-600 hover:underline">
          ← Tableau de bord
        </Link>
      </div>

      <DocumentsManager documents={documents ?? []} />
    </main>
  );
}
