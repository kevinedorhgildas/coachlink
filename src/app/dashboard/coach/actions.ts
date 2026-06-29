"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCoachProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Non authentifié." };
  }

  const specialite = formData.get("specialite") as string;
  const ville = formData.get("ville") as string;
  const tarif_horaire = Number(formData.get("tarif_horaire"));
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("coaches")
    .update({ specialite, ville, tarif_horaire, description })
    .eq("id", userData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/coach");
  return { success: true };
}

export async function uploadCoachPhoto(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Non authentifié." };
  }

  const file = formData.get("photo") as File;
  if (!file || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }

  const extension = file.name.split(".").pop();
  const path = `${userData.user.id}/photo.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("coaches")
    .update({ photo_url: publicUrlData.publicUrl })
    .eq("id", userData.user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/dashboard/coach");
  return { success: true };
}

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

export async function addDisponibilite(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Non authentifié." };
  }

  const jour_semaine = formData.get("jour_semaine") as string;
  const heure_debut = formData.get("heure_debut") as string;
  const heure_fin = formData.get("heure_fin") as string;

  if (!JOURS.includes(jour_semaine) || !heure_debut || !heure_fin) {
    return { error: "Créneau invalide." };
  }

  const { error } = await supabase.from("disponibilites").insert({
    coach_id: userData.user.id,
    jour_semaine,
    heure_debut,
    heure_fin,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/coach");
  return { success: true };
}

export async function updateReservationStatut(id: string, statut: "confirmee" | "refusee") {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Non authentifié." };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ statut })
    .eq("id", id)
    .eq("coach_id", userData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/coach");
  return { success: true };
}

export async function deleteDisponibilite(id: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Non authentifié." };
  }

  const { error } = await supabase
    .from("disponibilites")
    .delete()
    .eq("id", id)
    .eq("coach_id", userData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/coach");
  return { success: true };
}
