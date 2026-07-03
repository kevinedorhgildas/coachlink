"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function envoyerMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const receiver_id = formData.get("receiver_id") as string;
  const contenu = (formData.get("contenu") as string)?.trim();
  if (!contenu || !receiver_id) return;

  await supabase.from("messages").insert({ sender_id: userData.user.id, receiver_id, contenu });
  revalidatePath("/dashboard/client/messages/" + receiver_id);
  revalidatePath("/dashboard/coach/messages/" + receiver_id);
}

export async function marquerCommeLu(senderId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  await supabase
    .from("messages")
    .update({ lu: true })
    .eq("receiver_id", userData.user.id)
    .eq("sender_id", senderId)
    .eq("lu", false);
}
