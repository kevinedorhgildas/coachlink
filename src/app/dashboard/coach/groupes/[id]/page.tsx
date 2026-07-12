import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GroupeChat from "@/components/GroupeChat";
import MembreManager from "./MembreManager";

const GOLD = "#C9A96E";

export default async function GroupeDetailCoachPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: groupe } = await supabase
    .from("groupes_discussion")
    .select("id, nom, description, coach_id")
    .eq("id", params.id)
    .eq("coach_id", userData.user.id)
    .single();

  if (!groupe) notFound();

  const { data: profile } = await supabase.from("profiles").select("nom").eq("id", userData.user.id).single();

  // Membres du groupe (sauf le coach)
  const { data: membres } = await supabase
    .from("groupe_membres")
    .select("user_id, profiles(nom, email)")
    .eq("groupe_id", params.id)
    .neq("user_id", userData.user.id);

  // Messages
  const { data: messagesRaw } = await supabase
    .from("groupe_messages")
    .select("id, contenu, created_at, auteur_id, profiles(nom)")
    .eq("groupe_id", params.id)
    .order("created_at", { ascending: true });

  const messages = (messagesRaw ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles as { nom: string } | null;
    return { id: m.id, contenu: m.contenu, created_at: m.created_at, auteur_id: m.auteur_id, auteur_nom: p?.nom ?? "?" };
  });

  // Clients du coach (pour ajouter des membres)
  const membresIds = new Set((membres ?? []).map((m) => m.user_id));
  const { data: reservations } = await supabase
    .from("reservations")
    .select("client_id, profiles!reservations_client_id_fkey(nom, email)")
    .eq("coach_id", userData.user.id)
    .neq("client_id", userData.user.id);

  const clientsUniques = new Map<string, { id: string; nom: string; email: string }>();
  for (const r of reservations ?? []) {
    if (!clientsUniques.has(r.client_id)) {
      const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string; email: string } | null;
      clientsUniques.set(r.client_id, { id: r.client_id, nom: p?.nom ?? "?", email: p?.email ?? "" });
    }
  }

  const membresData = (membres ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles as { nom: string; email: string } | null;
    return { id: m.user_id, nom: p?.nom ?? "?", email: p?.email ?? "" };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <Link href="/dashboard/coach/groupes" className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:text-gray-600 transition">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{groupe.nom}</h1>
          {groupe.description && <p className="text-xs text-gray-400">{groupe.description}</p>}
        </div>
        <span className="text-xs font-semibold rounded-full px-2.5 py-1" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>
          {membresData.length} client{membresData.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat */}
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <GroupeChat
            groupeId={params.id}
            messages={messages}
            currentUserId={userData.user.id}
            currentNom={profile?.nom ?? "Coach"}
          />
        </div>

        {/* Panneau membres */}
        <div className="w-64 shrink-0">
          <MembreManager
            groupeId={params.id}
            membres={membresData}
            clientsDisponibles={[...clientsUniques.values()].filter((c) => !membresIds.has(c.id))}
          />
        </div>
      </div>
    </div>
  );
}
