"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfilCoach(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Non authentifié");

  const nom = formData.get("nom") as string;
  const ville = formData.get("ville") as string;
  const specialite = formData.get("specialite") as string;
  const tarif_horaire = parseFloat(formData.get("tarif_horaire") as string) || 0;
  const description = formData.get("description") as string;
  const newPassword = formData.get("new_password") as string;

  await Promise.all([
    supabase.from("profiles").update({ nom }).eq("id", userData.user.id),
    supabase.from("coaches").update({ ville, specialite, tarif_horaire, description }).eq("id", userData.user.id),
  ]);

  if (newPassword && newPassword.length >= 6) {
    await supabase.auth.updateUser({ password: newPassword });
  }

  revalidatePath("/dashboard/coach/compte");
  return { success: true };
}

export async function updateProfilClient(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Non authentifié");

  const nom = formData.get("nom") as string;
  const ville = formData.get("ville") as string;
  const newPassword = formData.get("new_password") as string;

  await Promise.all([
    supabase.from("profiles").update({ nom }).eq("id", userData.user.id),
    supabase.from("clients").update({ ville }).eq("id", userData.user.id),
  ]);

  if (newPassword && newPassword.length >= 6) {
    await supabase.auth.updateUser({ password: newPassword });
  }

  revalidatePath("/dashboard/client/compte");
  return { success: true };
}
