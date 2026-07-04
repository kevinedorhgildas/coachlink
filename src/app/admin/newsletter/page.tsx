import AdminNewsletterForm from "./AdminNewsletterForm";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("newsletter_abonnes")
    .select("id", { count: "exact", head: true })
    .eq("actif", true);

  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Administration</p>
        <h1 className="text-3xl font-bold text-gray-900">Envoyer une newsletter</h1>
        <p className="mt-2 text-gray-500">
          <span className="font-bold" style={{ color: GOLD }}>{count ?? 0}</span>{" "}
          abonné{(count ?? 0) > 1 ? "s" : ""} actif{(count ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <AdminNewsletterForm />
        </div>
      </div>
    </main>
  );
}
