"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Les trois buckets où un utilisateur dépose des fichiers, un dossier par compte. */
const BUCKETS = ["avatars", "documents", "media"] as const;

/**
 * Suppression définitive du compte — droit à l'effacement (art. 17 RGPD).
 *
 * L'effacement en base est fait par `supprimer_mon_compte()` : retirer une
 * ligne de `auth.users` demande des droits qu'une session utilisateur n'a pas,
 * et la seule autre voie serait d'embarquer une clé `service_role` dans
 * l'application — une clé qui, si elle fuite, ouvre toute la base en
 * contournant RLS. La fonction, elle, ne peut supprimer que le compte qui
 * l'appelle. Toutes les clés étrangères remontant à `auth.users` en CASCADE,
 * les 23 tables se vident d'elles-mêmes.
 *
 * Les fichiers, eux, doivent partir avant, et depuis ici : Supabase interdit
 * toute suppression directe dans `storage.objects`, y compris en
 * `security definer` — un déclencheur `protect_delete` la refuse pour éviter
 * les objets orphelins. Seule l'API Storage sait le faire.
 *
 * L'ordre compte : les fichiers d'abord, tant que la session est valide ;
 * le compte ensuite. L'inverse laisserait des fichiers que plus personne n'a
 * le droit de supprimer.
 */
export async function supprimerMonCompte() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Non authentifié." };

  const uid = userData.user.id;

  for (const bucket of BUCKETS) {
    const { data: fichiers } = await supabase.storage.from(bucket).list(uid);
    if (fichiers?.length) {
      await supabase.storage.from(bucket).remove(fichiers.map((f) => `${uid}/${f.name}`));
    }
  }

  const { error } = await supabase.rpc("supprimer_mon_compte");
  if (error) return { error: "La suppression a échoué. Contactez le support." };

  // La session porte encore un jeton dont le compte n'existe plus : il faut la
  // fermer explicitement, sinon le visiteur reste « connecté » à un fantôme.
  await supabase.auth.signOut();
  redirect("/?compte=supprime");
}
