import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const GOLD = "#C9A96E";

export default async function ClientMessagesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, contenu, created_at, lu, sender_id, receiver_id")
    .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
    .order("created_at", { ascending: false });

  type Msg = { id: string; contenu: string; created_at: string; lu: boolean; sender_id: string; receiver_id: string };
  const conversationsMap = new Map<string, { lastMessage: Msg; unread: number }>();
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
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: `${GOLD}22` }}>💬</div>
          <p className="font-medium text-gray-700">Aucun message pour le moment.</p>
          <Link href="/dashboard/client" className="mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Trouver un coach
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
          {conversations.map(({ coachId, coach, lastMessage, unread }) => (
            <div key={coachId} className="flex items-center gap-3 p-4 transition hover:bg-gray-50">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                {coach?.photo_url
                  ? <img src={coach.photo_url} alt="" className="h-full w-full object-cover" />
                  : <span className="text-gray-300 text-lg">👤</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {coach?.nom ?? "Coach"}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {unread > 0 && (
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: GOLD }}>{unread}</span>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(lastMessage.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 truncate">{lastMessage.contenu}</p>
                <div className="mt-2 flex gap-2">
                  <Link href={`/dashboard/client/messages/${coachId}`} className="rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                    Ouvrir →
                  </Link>
                  <Link href={`/coachs/${coachId}`} className="rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
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
