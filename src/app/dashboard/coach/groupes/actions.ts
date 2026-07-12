"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createGroupe(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const nom = formData.get("nom") as string;
  const description = formData.get("description") as string;
  if (!nom) return { error: "Le nom du groupe est obligatoire." };

  const { data: groupe, error } = await supabase
    .from("groupes_discussion")
    .insert({ coach_id: userData.user.id, nom, description })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Ajouter le coach lui-même comme membre
  await supabase.from("groupe_membres").insert({ groupe_id: groupe.id, user_id: userData.user.id });

  revalidatePath("/dashboard/coach/groupes");
  return { success: true, id: groupe.id };
}

export async function addMembre(groupeId: string, userId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const { error } = await supabase.from("groupe_membres").insert({ groupe_id: groupeId, user_id: userId });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/coach/groupes");
  return { success: true };
}

export async function removeMembre(groupeId: string, userId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  await supabase.from("groupe_membres").delete().eq("groupe_id", groupeId).eq("user_id", userId);
  revalidatePath("/dashboard/coach/groupes");
  return { success: true };
}

export async function sendGroupeMessage(groupeId: string, contenu: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };
  if (!contenu.trim()) return { error: "Message vide." };

  const { error } = await supabase.from("groupe_messages").insert({
    groupe_id: groupeId,
    auteur_id: userData.user.id,
    contenu: contenu.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/coach/groupes/${groupeId}`);
  revalidatePath(`/dashboard/client/groupes/${groupeId}`);
  return { success: true };
}

export async function deleteGroupe(groupeId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  await supabase.from("groupes_discussion").delete().eq("id", groupeId).eq("coach_id", userData.user.id);
  revalidatePath("/dashboard/coach/groupes");
  return { success: true };
}
