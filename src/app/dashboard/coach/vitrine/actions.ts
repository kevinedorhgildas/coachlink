"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadMedia(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non connecté" };

  const fichier = formData.get("fichier") as File;
  const type = formData.get("type") as string;
  const legende = formData.get("legende") as string;

  if (!fichier || fichier.size === 0) return { error: "Fichier manquant" };
  if (fichier.size > 50 * 1024 * 1024) return { error: "Fichier trop lourd (max 50 Mo)" };

  const ext = fichier.name.split(".").pop();
  const path = `${userData.user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("media").upload(path, fichier);
  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);

  const { error: dbError } = await supabase.from("media_coach").insert({
    coach_id: userData.user.id,
    type,
    url: urlData.publicUrl,
    legende: legende || null,
  });

  if (dbError) return { error: dbError.message };
  revalidatePath("/dashboard/coach/vitrine");
  return { success: true };
}

export async function deleteMedia(id: string, url: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const path = url.split("/media/")[1];
  if (path) await supabase.storage.from("media").remove([path]);
  await supabase.from("media_coach").delete().eq("id", id);
  revalidatePath("/dashboard/coach/vitrine");
}

export async function addTemoignage(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non connecté" };

  const auteur = formData.get("auteur") as string;
  const contenu = formData.get("contenu") as string;
  const note = Number(formData.get("note"));

  if (!auteur || !contenu) return { error: "Champs obligatoires manquants" };

  const { error } = await supabase.from("temoignages").insert({
    coach_id: userData.user.id,
    auteur,
    contenu,
    note: note || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/coach/vitrine");
  return { success: true };
}

export async function deleteTemoignage(id: string) {
  const supabase = await createClient();
  await supabase.from("temoignages").delete().eq("id", id);
  revalidatePath("/dashboard/coach/vitrine");
}
