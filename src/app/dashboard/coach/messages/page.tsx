import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoachMessagesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, contenu, created_at, lu, sender_id, receiver_id")
    .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
    .order("created_at", { ascending: false });

  const conversationsMap = new Map<string, { lastMessage: typeof messages[0]; unread: number }>();
  for (const msg of messages ?? []) {
    const otherId = msg.sender_id === userData.user.id ? msg.receiver_id : msg.sender_id;
    if (!conversationsMap.has(otherId)) {
      conversationsMap.set(otherId, { lastMessage: msg, unread: 0 });
    }
    if (!msg.lu && msg.receiver_id === userData.user.id) {
      conversationsMap.get(otherId)!.unread++;
    }
  }

  const clientIds = Array.from(conversationsMap.keys());

  const { data: profiles } = clientIds.length > 0
    ? await supabase.from("profiles").select("id, nom, photo_url").in("id", clientIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const conversations = clientIds.map((id) => ({
    clientId: id,
    profile: profileMap.get(id),
    ...conversationsMap.get(id)!,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">Vos conversations avec vos clients.</p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500">Aucun message pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {conversations.map(({ clientId, profile, lastMessage, unread }) => (
            <div key={clientId} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-300">👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {profile?.nom ?? "Client"}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {unread > 0 && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(lastMessage.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 truncate">{lastMessage.contenu}</p>
                <div className="mt-2">
                  <Link href={`/dashboard/coach/messages/${clientId}`} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                    Répondre →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
