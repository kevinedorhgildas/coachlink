/**
 * Les repères des documents contractuels.
 *
 * La version des CGU est enregistrée sur chaque compte au moment de
 * l'inscription : la date seule ne suffirait pas à savoir *ce qui* a été
 * accepté, puisque le document évolue. D'où une constante unique, lue à la
 * fois par la page qui affiche les CGU et par l'action qui enregistre le
 * consentement — les deux ne peuvent donc pas diverger.
 *
 * En modifiant les CGU, changer cette date : les comptes existants garderont
 * la trace de la version qu'ils ont réellement acceptée, et l'écart se lira.
 */
export const CGU_VERSION = "2026-07-03";

/** La même date, telle qu'elle s'affiche en bas des documents légaux. */
export const CGU_VERSION_AFFICHEE = "3 juillet 2026";

/**
 * La mention d'information à joindre au premier contact d'un prospect.
 *
 * L'article 14 du RGPD vise les données qui ne viennent pas de la personne :
 * un coach relevé sur Instagram ou LinkedIn n'a rien fourni ni rien demandé.
 * Il faut alors l'informer — dans le mois, ou dès la première communication
 * si elle vient avant, ce qui est le cas ici.
 *
 * Le texte est court à dessein : placé en pied d'un message de démarchage, il
 * doit couvrir l'origine des données, la finalité, la base légale, la durée et
 * les droits, sans transformer le message en formulaire.
 */
export const MENTION_PROSPECTION = `Vos coordonnées professionnelles ont été relevées sur une source publique (site, réseau social ou annuaire) afin de vous présenter CoachLink. Elles sont traitées sur la base de notre intérêt légitime à prospecter, conservées trois ans au plus après notre dernier échange, et ne sont transmises à personne. Vous pouvez à tout moment demander leur consultation, leur rectification, leur effacement, ou vous opposer à ce démarchage, en écrivant à contact@coachlink.fr. Notre politique de confidentialité : https://www.coach-link.fr/confidentialite`;
