"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const file = formData.get("fichier") as File;
  const nom = (formData.get("nom") as string)?.trim();

  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (file.type !== "application/pdf") return { error: "Seuls les fichiers PDF sont acceptés." };
  if (file.size > 10 * 1024 * 1024) return { error: "Le fichier ne doit pas dépasser 10 Mo." };
  if (!nom) return { error: "Le nom du document est obligatoire." };

  const path = `${userData.user.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file);

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

  const { error: dbError } = await supabase.from("documents").insert({
    coach_id: userData.user.id,
    nom,
    url: urlData.publicUrl,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath("/dashboard/coach/documents");
  return { success: true };
}

export async function deleteDocument(id: string, url: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  // Extraire le path depuis l'URL
  const path = url.split("/storage/v1/object/public/documents/")[1];
  if (path) {
    await supabase.storage.from("documents").remove([path]);
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("coach_id", userData.user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/coach/documents");
  return { success: true };
}
