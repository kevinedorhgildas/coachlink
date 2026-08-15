"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

/**
 * Inscription à la newsletter.
 *
 * Passe par la fonction `newsletter_inscrire` plutôt que d'écrire directement
 * dans la table : `newsletter_abonnes` n'accepte plus ni INSERT ni UPDATE
 * anonyme, et sa lecture est réservée aux admins. La fonction, en
 * `security definer`, est le seul geste ouvert au public — elle ne peut
 * qu'inscrire ou réactiver, jamais lire ni modifier autre chose.
 *
 * La réponse est volontairement la même que l'adresse ait été inscrite ou
 * qu'elle le fût déjà. L'ancien message « Cet email est déjà inscrit »
 * répondait à une question que le visiteur n'avait pas le droit de poser :
 * il suffisait de soumettre une adresse pour savoir si elle figurait dans la
 * liste — l'appartenance à une liste de diffusion étant elle-même une donnée
 * personnelle. Seul le format invalide justifie encore une réponse distincte,
 * puisqu'il ne dit rien de l'adresse mais du texte saisi.
 */
export async function sInscrireNewsletter(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Email invalide." };

  const supabase = await createClient();

  const { data: issue, error } = await supabase.rpc("newsletter_inscrire", {
    p_email: email,
  });

  if (error) return { error: "Erreur lors de l'inscription." };
  if (issue === "email_invalide") return { error: "Email invalide." };

  // L'email de bienvenue n'est envoyé qu'à une vraie première inscription :
  // ni une réactivation, ni une adresse déjà inscrite ne le justifient. C'est
  // aussi ce qui empêche d'utiliser le formulaire pour inonder un tiers.
  if (issue === "inscrit") {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "CoachLink <onboarding@resend.dev>",
      to: email,
      subject: "Bienvenue dans la newsletter CoachLink",
      // Le lien de désabonnement porte un jeton que cette action ne peut pas
      // lire : `newsletter_inscrire` ne rend qu'un statut, et la table est
      // fermée en lecture. D'où le renvoi au lien présent dans chaque envoi,
      // et une adresse de retrait qui, elle, fonctionne sans jeton.
      text: `Bonjour,\n\nVous êtes maintenant inscrit(e) à la newsletter CoachLink.\nVous recevrez nos actualités, conseils et offres exclusives.\n\nVous pouvez retirer votre consentement à tout moment : chaque newsletter porte un lien de désabonnement en bas de message, et vous pouvez sinon nous écrire à contact@coachlink.fr.\nNotre politique de confidentialité : ${process.env.NEXT_PUBLIC_SITE_URL}/confidentialite\n\nL'équipe CoachLink\ncontact@coachlink.fr`,
    });
  }

  return { success: true };
}

/**
 * Désabonnement par jeton.
 *
 * La fonction appelée ne sait faire qu'une chose — passer `actif` à faux sur
 * la ligne portant ce jeton. L'ancienne politique `UPDATE using (true)`
 * laissait au contraire n'importe qui modifier n'importe quelle ligne : il
 * suffisait d'un appel sans filtre pour désabonner tous les inscrits.
 */
export async function seDesabonner(token: string) {
  const supabase = await createClient();

  const { data: desabonne, error } = await supabase.rpc("newsletter_desabonner", {
    p_token: token,
  });

  if (error) return { error: "Lien invalide ou déjà désabonné." };
  if (!desabonne) return { error: "Lien invalide ou déjà désabonné." };
  return { success: true };
}

/**
 * Envoi de la newsletter.
 *
 * Le mot de passe seul ne suffisait pas : une action serveur est appelable
 * directement, sans passer par la page d'administration, si bien que la liste
 * des abonnés ne tenait qu'à ce secret partagé. Le rôle `admin` est désormais
 * vérifié côté serveur — c'est aussi lui que la politique de lecture exige,
 * les deux contrôles disent maintenant la même chose.
 */
export async function envoyerNewsletter(formData: FormData) {
  const sujet = formData.get("sujet") as string;
  const contenu = formData.get("contenu") as string;
  const motDePasse = formData.get("mot_de_passe") as string;

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Accès refusé." };

  if (motDePasse !== process.env.ADMIN_NEWSLETTER_PASSWORD) {
    return { error: "Mot de passe incorrect." };
  }
  if (!sujet || !contenu) return { error: "Sujet et contenu obligatoires." };

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
