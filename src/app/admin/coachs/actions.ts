"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCoachStatut(coachId: string, statut: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") return { error: "Accès refusé." };

  const { error } = await supabase.from("coaches").update({ statut }).eq("id", coachId);
  if (error) return { error: error.message };

  revalidatePath("/admin/coachs");
  return { success: true };
}
