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
  const instagram = formData.get("instagram") as string;
  const tiktok = formData.get("tiktok") as string;
  const snapchat = formData.get("snapchat") as string;
  const facebook = formData.get("facebook") as string;
  const x = formData.get("x") as string;
  const youtube = formData.get("youtube") as string;
  const newPassword = formData.get("new_password") as string;

  await Promise.all([
    supabase.from("profiles").update({ nom }).eq("id", userData.user.id),
    supabase.from("coaches").update({
      ville, specialite, tarif_horaire, description,
      instagram: instagram || null,
      tiktok: tiktok || null,
      snapchat: snapchat || null,
      facebook: facebook || null,
      x: x || null,
      youtube: youtube || null,
    }).eq("id", userData.user.id),
  ]);

  if (newPassword && newPassword.length >= 6) {
    await supabase.auth.updateUser({ password: newPassword });
  }

  revalidatePath("/dashboard/coach/compte");
  return { success: true };
}

export async function uploadPhotoCoach(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Non authentifié");

  const file = formData.get("photo") as File;
  if (!file || file.size === 0) throw new Error("Aucun fichier");

  const ext = file.name.split(".").pop();
  const path = `photos-profil/${userData.user.id}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
  await supabase.from("coaches").update({ photo_url: urlData.publicUrl }).eq("id", userData.user.id);

  revalidatePath("/dashboard/coach/compte");
  return { success: true };
}

export async function uploadPhotoClient(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Non authentifié");

  const file = formData.get("photo") as File;
  if (!file || file.size === 0) throw new Error("Aucun fichier");

  const ext = file.name.split(".").pop();
  const path = `photos-profil-clients/${userData.user.id}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
  await supabase.from("clients").update({ photo_url: urlData.publicUrl }).eq("id", userData.user.id);

  revalidatePath("/dashboard/client/compte");
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
