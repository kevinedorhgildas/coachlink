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
 * C'est aussi ce qui répare le cas « déjà inscrit » : le contrôle d'existence
 * se faisait auparavant par un SELECT que RLS bloquait silencieusement, si
 * bien que l'utilisateur recevait une erreur générique au lieu du bon message.
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
  if (issue === "deja_inscrit") return { error: "Cet email est déjà inscrit." };

  // L'email de bienvenue n'est envoyé qu'à une vraie première inscription :
  // une réactivation ne justifie pas de renvoyer un message de bienvenue.
  if (issue === "inscrit") {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "CoachLink <onboarding@resend.dev>",
      to: email,
      subject: "Bienvenue dans la newsletter CoachLink",
      text: `Bonjour,\n\nVous êtes maintenant inscrit(e) à la newsletter CoachLink.\nVous recevrez nos actualités, conseils et offres exclusives.\n\nL'équipe CoachLink\ncontact@coachlink.fr`,
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
