"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadClientPhoto(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const file = formData.get("photo") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };

  const extension = file.name.split(".").pop();
  const path = `${userData.user.id}/photo.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("clients")
    .update({ photo_url: urlData.publicUrl })
    .eq("id", userData.user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/client/compte");
  return { success: true };
}
