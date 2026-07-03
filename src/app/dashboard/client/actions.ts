"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavori(coachId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: existing } = await supabase
    .from("favoris")
    .select("id")
    .eq("client_id", userData.user.id)
    .eq("coach_id", coachId)
    .single();

  if (existing) {
    await supabase.from("favoris").delete().eq("id", existing.id);
  } else {
    await supabase.from("favoris").insert({ client_id: userData.user.id, coach_id: coachId });
  }

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/favoris");
}
