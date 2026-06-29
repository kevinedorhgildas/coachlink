"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Role = "coach" | "client";

export async function signup(formData: FormData) {
  const role = formData.get("role") as Role;
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!role || !nom || !email || !password) {
    return { error: "Tous les champs sont obligatoires." };
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
  });

  if (profileError) {
    return { error: profileError.message };
  }

  if (role === "coach") {
    const { error: coachError } = await supabase.from("coaches").insert({
      id: userId,
      specialite: "",
      tarif_horaire: 0,
      ville: "",
      description: "",
    });
    if (coachError) {
      return { error: coachError.message };
    }
  } else {
    const { error: clientError } = await supabase.from("clients").insert({
      id: userId,
      ville: "",
    });
    if (clientError) {
      return { error: clientError.message };
    }
  }

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
