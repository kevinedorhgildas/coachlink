"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPack(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const nom = formData.get("nom") as string;
  const description = formData.get("description") as string;
  const nb_seances = parseInt(formData.get("nb_seances") as string);
  const prix = parseFloat(formData.get("prix") as string);

  if (!nom || !nb_seances || !prix) return { error: "Tous les champs sont obligatoires." };

  const { error } = await supabase.from("packs_seances").insert({
    coach_id: userData.user.id,
    nom,
    description,
    nb_seances,
    prix,
    actif: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/coach/packs");
  return { success: true };
}

export async function togglePack(packId: string, actif: boolean) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("packs_seances")
    .update({ actif })
    .eq("id", packId)
    .eq("coach_id", userData.user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/coach/packs");
  return { success: true };
}

export async function deletePack(packId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("packs_seances")
    .delete()
    .eq("id", packId)
    .eq("coach_id", userData.user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/coach/packs");
  return { success: true };
}
