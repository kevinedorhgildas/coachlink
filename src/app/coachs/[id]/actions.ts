"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function contactCoach(formData: FormData) {
  const coachId = formData.get("coachId") as string;
  const nomClient = formData.get("nom") as string;
  const emailClient = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!coachId || !nomClient || !emailClient || !message) {
    return { error: "Tous les champs sont obligatoires." };
  }

  const supabase = await createClient();

  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("email, nom")
    .eq("id", coachId)
    .single();

  if (!coachProfile?.email) {
    return { error: "Coach introuvable." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "CoachLink <onboarding@resend.dev>",
    to: coachProfile.email,
    replyTo: emailClient,
    subject: `Nouveau message via CoachLink de ${nomClient}`,
    text: `${nomClient} (${emailClient}) vous a envoyé un message :\n\n${message}`,
  });

  if (error) {
    return { error: "Erreur lors de l'envoi de l'email. Réessayez plus tard." };
  }

  return { success: true };
}

export async function addAvis(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Vous devez être connecté pour laisser un avis." };
  }

  const coachId = formData.get("coachId") as string;
  const note = Number(formData.get("note"));
  const commentaire = formData.get("commentaire") as string;

  if (!coachId || !note || note < 1 || note > 5) {
    return { error: "Note invalide." };
  }

  const { error } = await supabase
    .from("avis")
    .upsert(
      { coach_id: coachId, client_id: userData.user.id, note, commentaire },
      { onConflict: "coach_id,client_id" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/coachs/${coachId}`);
  return { success: true };
}

export async function requestReservation(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Vous devez être connecté pour réserver un créneau." };
  }

  const coachId = formData.get("coachId") as string;
  const disponibiliteId = formData.get("disponibiliteId") as string;
  const dateSouhaitee = formData.get("date_souhaitee") as string;
  const message = formData.get("message") as string;

  if (!coachId || !disponibiliteId || !dateSouhaitee) {
    return { error: "Veuillez choisir un créneau et une date." };
  }

  const typeSeance = (formData.get("type_seance") as string) || "individuel";

  const { error } = await supabase.from("reservations").insert({
    coach_id: coachId,
    client_id: userData.user.id,
    disponibilite_id: disponibiliteId,
    date_souhaitee: dateSouhaitee,
    message,
    type_seance: typeSeance,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/coachs/${coachId}`);
  return { success: true };
}
