import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { marquerCommeLu } from "@/app/dashboard/messages/actions";
import MessageForm from "@/components/MessageForm";

export default async function CoachConversationPage({ params }: { params: { clientId: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/connexion");

  const clientId = params.clientId;
  await marquerCommeLu(clientId);

  const [{ data: messages }, { data: profile }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, contenu, created_at, sender_id")
      .or(`and(sender_id.eq.${userData.user.id},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${userData.user.id})`)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, nom, photo_url").eq("id", clientId).single(),
  ]);

  const nomClient = profile?.nom ?? "Client";

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Link href="/dashboard/coach/messages" className="text-gray-400 hover:text-gray-600 text-sm">←</Link>
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-300">👤</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{nomClient}</p>
          <p className="text-xs text-gray-400">Client</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        {(!messages || messages.length === 0) && (
          <p className="text-center text-sm text-gray-400 mt-8">Commencez la conversation avec {nomClient}.</p>
        )}
        {(messages ?? []).map((msg) => {
          const isMe = msg.sender_id === userData.user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"}`}>
                <p>{msg.contenu}</p>
                <p className={`mt-1 text-xs ${isMe ? "text-emerald-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form */}
      <div className="mt-3">
        <MessageForm receiverId={clientId} />
      </div>
    </div>
  );
}
