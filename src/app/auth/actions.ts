"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CGU_VERSION } from "@/lib/legal";

type Role = "coach" | "client";

export async function signup(formData: FormData) {
  const role = formData.get("role") as Role;
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const specialite = (formData.get("specialite") as string) ?? "";
  const cgu = formData.get("cgu");

  if (!role || !nom || !email || !password) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (role === "coach" && !specialite) {
    return { error: "Le domaine du coach est obligatoire." };
  }
  // La case porte `required`, mais c'est une garde de navigateur : le
  // formulaire peut être soumis sans elle. Or l'acceptation des CGU est ce qui
  // fonde le contrat, donc la base légale du traitement — elle se vérifie ici.
  if (!cgu) {
    return { error: "Vous devez accepter les CGU et la politique de confidentialité." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { error: error?.message ?? "Erreur lors de l'inscription." };
  }

  const userId = data.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role,
    nom,
    email,
    // La preuve du consentement : quand, et à quelle version du document.
    cgu_acceptees_le: new Date().toISOString(),
    cgu_version: CGU_VERSION,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  // Créer les deux enregistrements pour permettre de switcher entre espaces
  await supabase.from("coaches").upsert({
    id: userId,
    specialite: specialite || "",
    tarif_horaire: 0,
    ville: "",
    description: "",
  }, { onConflict: "id" });

  await supabase.from("clients").upsert({
    id: userId,
    ville: "",
  }, { onConflict: "id" });

  redirect(role === "coach" ? "/dashboard/coach" : "/dashboard/client");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Email ou mot de passe incorrect." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(profile?.role === "coach" ? "/dashboard/coach" : "/dashboard/client");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
