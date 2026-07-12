"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Non authentifié");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") throw new Error("Accès refusé");
  return supabase;
}

export async function createProspect(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("prospects").insert({
    nom: formData.get("nom") as string,
    contact: formData.get("contact") as string,
    canal: formData.get("canal") as string,
    specialite: formData.get("specialite") as string || null,
    notes: formData.get("notes") as string || null,
    code_promo: formData.get("code_promo") as string || null,
  });
  revalidatePath("/admin/prospects");
}

export async function updateStatut(id: string, statut: string) {
  const supabase = await requireAdmin();
  await supabase.from("prospects").update({ statut, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/prospects");
}

export async function updateNotes(id: string, notes: string) {
  const supabase = await requireAdmin();
  await supabase.from("prospects").update({ notes, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/prospects");
}

export async function deleteProspect(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("prospects").delete().eq("id", id);
  revalidatePath("/admin/prospects");
}
