"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthRecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Vérifie le hash dans l'URL immédiatement
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      router.push("/reinitialiser-mot-de-passe" + hash);
      return;
    }

    // Fallback : écoute l'événement Supabase
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push("/reinitialiser-mot-de-passe");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
