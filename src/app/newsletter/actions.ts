"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function sInscrireNewsletter(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Email invalide." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("newsletter_abonnes")
    .select("id, actif")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.actif) return { error: "Cet email est déjà inscrit." };
    await supabase.from("newsletter_abonnes").update({ actif: true }).eq("email", email);
    return { success: true };
  }

  const { error } = await supabase.from("newsletter_abonnes").insert({ email });
  if (error) return { error: "Erreur lors de l'inscription." };

  // Email de confirmation
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "CoachLink <onboarding@resend.dev>",
    to: email,
    subject: "Bienvenue dans la newsletter CoachLink 🎉",
    text: `Bonjour,\n\nVous êtes maintenant inscrit(e) à la newsletter CoachLink.\nVous recevrez nos actualités, conseils et offres exclusives.\n\nL'équipe CoachLink\ncontact@coachlink.fr`,
  });

  return { success: true };
}

export async function seDesabonner(token: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_abonnes")
    .update({ actif: false })
    .eq("token", token);
  if (error) return { error: "Lien invalide ou déjà désabonné." };
  return { success: true };
}

export async function envoyerNewsletter(formData: FormData) {
  const sujet = formData.get("sujet") as string;
  const contenu = formData.get("contenu") as string;
  const motDePasse = formData.get("mot_de_passe") as string;

  if (motDePasse !== process.env.ADMIN_NEWSLETTER_PASSWORD) {
    return { error: "Mot de passe incorrect." };
  }
  if (!sujet || !contenu) return { error: "Sujet et contenu obligatoires." };

  const supabase = await createClient();
  const { data: abonnes } = await supabase
    .from("newsletter_abonnes")
    .select("email, token")
    .eq("actif", true);

  if (!abonnes || abonnes.length === 0) return { error: "Aucun abonné actif." };

  const resend = new Resend(process.env.RESEND_API_KEY);
  let envoyes = 0;

  for (const abonne of abonnes) {
    const lienDesabo = `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/desabonnement?token=${abonne.token}`;
    await resend.emails.send({
      from: "CoachLink <onboarding@resend.dev>",
      to: abonne.email,
      subject: sujet,
      text: `${contenu}\n\n---\nVous recevez cet email car vous êtes inscrit(e) à la newsletter CoachLink.\nSe désabonner : ${lienDesabo}`,
    });
    envoyes++;
  }

  return { success: true, envoyes };
}
