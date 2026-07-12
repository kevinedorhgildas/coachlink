import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GroupeChat from "@/components/GroupeChat";

export default async function GroupeDetailClientPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  // Vérifier que l'utilisateur est membre
  const { data: membership } = await supabase
    .from("groupe_membres")
    .select("groupe_id")
    .eq("groupe_id", params.id)
    .eq("user_id", userData.user.id)
    .single();

  if (!membership) notFound();

  const { data: groupe } = await supabase
    .from("groupes_discussion")
    .select("id, nom, description, coach_id, profiles!groupes_discussion_coach_id_fkey(nom)")
    .eq("id", params.id)
    .single();

  if (!groupe) notFound();

  const { data: profile } = await supabase.from("profiles").select("nom").eq("id", userData.user.id).single();

  const coachProfile = Array.isArray(groupe.profiles) ? groupe.profiles[0] : groupe.profiles as { nom: string } | null;

  // Membres
  const { data: membres } = await supabase
    .from("groupe_membres")
    .select("user_id, profiles(nom)")
    .eq("groupe_id", params.id);

  const membresData = (membres ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles as { nom: string } | null;
    return { id: m.user_id, nom: p?.nom ?? "?" };
  });

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

  const GOLD = "#C9A96E";

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <Link href="/dashboard/client/groupes" className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:text-gray-600 transition">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{groupe.nom}</h1>
          <p className="text-xs" style={{ color: GOLD }}>Animé par {coachProfile?.nom ?? "Coach"}</p>
        </div>
        <div className="flex -space-x-2">
          {membresData.slice(0, 4).map((m) => (
            <div key={m.id} className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold"
              style={{ background: `${GOLD}33`, color: "#9A7A2E" }}>
              {m.nom.charAt(0).toUpperCase()}
            </div>
          ))}
          {membresData.length > 4 && (
            <div className="h-7 w-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{membresData.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
        <GroupeChat
          groupeId={params.id}
          messages={messages}
          currentUserId={userData.user.id}
          currentNom={profile?.nom ?? "Client"}
        />
      </div>
    </div>
  );
}
