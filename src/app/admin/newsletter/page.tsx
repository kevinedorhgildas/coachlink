import AdminNewsletterForm from "./AdminNewsletterForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("newsletter_abonnes")
    .select("id", { count: "exact", head: true })
    .eq("actif", true);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Envoyer une newsletter</h1>
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-semibold text-emerald-600">{count ?? 0}</span> abonné{(count ?? 0) > 1 ? "s" : ""} actif{(count ?? 0) > 1 ? "s" : ""}
        </p>
      </div>
      <AdminNewsletterForm />
    </main>
  );
}
