"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function acheterPack(packId: string, coachId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Connectez-vous pour acheter un pack." };

  const { data: pack } = await supabase
    .from("packs_seances")
    .select("nb_seances, actif")
    .eq("id", packId)
    .single();

  if (!pack || !pack.actif) return { error: "Ce pack n'est plus disponible." };

  const { error } = await supabase.from("achats_packs").insert({
    client_id: userData.user.id,
    pack_id: packId,
    nb_seances_restantes: pack.nb_seances,
    date_achat: new Date().toISOString(),
    statut: "actif",
  });

  if (error) return { error: error.message };
  revalidatePath(`/coachs/${coachId}`);
  return { success: true };
}
