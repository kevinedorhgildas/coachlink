"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPublication(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const contenu = formData.get("contenu") as string;
  const media_url = (formData.get("media_url") as string) || null;
  const type = media_url
    ? media_url.match(/\.(mp4|mov|webm)$/i) ? "video" : "photo"
    : "texte";

  if (!contenu.trim()) return { error: "Le contenu est obligatoire." };

  const { error } = await supabase.from("publications").insert({
    coach_id: userData.user.id,
    contenu: contenu.trim(),
    media_url,
    type,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/coach/publications");
  return { success: true };
}

export async function deletePublication(id: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  await supabase.from("publications").delete().eq("id", id).eq("coach_id", userData.user.id);
  revalidatePath("/dashboard/coach/publications");
  return { success: true };
}

export async function toggleLike(publicationId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const { data: existing } = await supabase
    .from("publication_likes")
    .select("id")
    .eq("publication_id", publicationId)
    .eq("user_id", userData.user.id)
    .single();

  if (existing) {
    await supabase.from("publication_likes").delete().eq("id", existing.id);
    return { liked: false };
  } else {
    await supabase.from("publication_likes").insert({ publication_id: publicationId, user_id: userData.user.id });
    return { liked: true };
  }
}

export async function addCommentaire(publicationId: string, contenu: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };
  if (!contenu.trim()) return { error: "Commentaire vide." };

  const { error } = await supabase.from("publication_commentaires").insert({
    publication_id: publicationId,
    auteur_id: userData.user.id,
    contenu: contenu.trim(),
  });

  if (error) return { error: error.message };
  return { success: true };
}
