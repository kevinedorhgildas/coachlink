import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientMessagesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, contenu, created_at, lu, sender_id, receiver_id")
    .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
    .order("created_at", { ascending: false });

  // Group by the other person (coach)
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

  const coachIds = Array.from(conversationsMap.keys());

  const { data: coaches } = coachIds.length > 0
    ? await supabase.from("coaches").select("id, specialite, photo_url, profiles(nom)").in("id", coachIds)
    : { data: [] };

  const coachMap = new Map((coaches ?? []).map((c) => {
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles as { nom: string } | null;
    return [c.id, { ...c, nom: p?.nom ?? "Coach" }];
  }));

  const conversations = coachIds.map((id) => ({
    coachId: id,
    coach: coachMap.get(id),
    ...conversationsMap.get(id)!,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">Vos conversations avec vos coachs.</p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500">Aucun message pour le moment.</p>
          <Link href="/dashboard/client" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {conversations.map(({ coachId, coach, lastMessage, unread }) => (
            <div key={coachId} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                {coach?.photo_url ? (
                  <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-300">👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {coach?.nom ?? "Coach"}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {unread > 0 && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(lastMessage.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 truncate">{lastMessage.contenu}</p>
                <div className="mt-2 flex gap-2">
                  <Link href={`/dashboard/client/messages/${coachId}`} className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition">
                    Ouvrir →
                  </Link>
                  <Link href={`/coachs/${coachId}`} className="rounded-lg border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">
                    Voir le profil →
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
