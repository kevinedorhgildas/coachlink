import { createClient } from "@/lib/supabase/server";
import CoachsAdminList from "./CoachsAdminList";

const GOLD = "#C9A96E";

export default async function AdminCoachsPage() {
  const supabase = await createClient();

  const { data: coaches } = await supabase
    .from("coaches")
    .select("id, specialite, ville, tarif_horaire, photo_url, statut, created_at, profiles(nom, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des coachs</h1>
          <p className="mt-1 text-sm text-gray-500">{coaches?.length ?? 0} coach{(coaches?.length ?? 0) > 1 ? "s" : ""} inscrits</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>
          {coaches?.filter((c) => (c as Record<string,unknown>).statut === "en_attente").length ?? 0} en attente
        </span>
      </div>

      <CoachsAdminList coaches={(coaches ?? []).map((c) => ({
        id: c.id,
        specialite: c.specialite,
        ville: c.ville,
        tarif_horaire: c.tarif_horaire,
        photo_url: c.photo_url,
        statut: ((c as Record<string,unknown>).statut as string) ?? "actif",
        created_at: c.created_at,
        nom: (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles as { nom: string; email: string } | null)?.nom ?? "—",
        email: (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles as { nom: string; email: string } | null)?.email ?? "",
      }))} />
    </div>
  );
}
