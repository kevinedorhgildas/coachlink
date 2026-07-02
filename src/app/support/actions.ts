"use server";

import { Resend } from "resend";

export async function contactSupport(formData: FormData) {
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const sujet = formData.get("sujet") as string;
  const message = formData.get("message") as string;

  if (!nom || !email || !sujet || !message) {
    return { error: "Tous les champs sont obligatoires." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "CoachLink <onboarding@resend.dev>",
    to: "contact@coachlink.fr",
    replyTo: email,
    subject: `[Support] ${sujet} — de ${nom}`,
    text: `Nom : ${nom}\nEmail : ${email}\n\nMessage :\n${message}`,
  });

  if (error) {
    return { error: "Erreur lors de l'envoi. Réessayez plus tard." };
  }

  return { success: true };
}
