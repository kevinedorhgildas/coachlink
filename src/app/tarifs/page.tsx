import { createClient } from "@/lib/supabase/server";
import TarifsClient from "./TarifsClient";

export default async function TarifsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  let currentPlan = "gratuit";
  if (userData.user) {
    const { data: coach } = await supabase.from("coaches").select("abonnement").eq("id", userData.user.id).single();
    currentPlan = (coach as Record<string, unknown>)?.abonnement as string ?? "gratuit";
  }

  return <TarifsClient currentPlan={currentPlan} isLoggedIn={!!userData.user} />;
}
