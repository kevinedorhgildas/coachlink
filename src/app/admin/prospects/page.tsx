import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProspectsManager from "./ProspectsManager";

export default async function ProspectsAdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prospects coachs</h1>
        <p className="mt-1 text-sm text-gray-500">Suivi de ta prospection — email, Instagram, LinkedIn.</p>
      </div>
      <ProspectsManager prospects={prospects ?? []} />
    </div>
  );
}
