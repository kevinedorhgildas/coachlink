"use client";

import { useState, useRef, useEffect } from "react";
import { sendGroupeMessage } from "@/app/dashboard/coach/groupes/actions";

const GOLD = "#C9A96E";

type Message = {
  id: string;
  contenu: string;
  created_at: string;
  auteur_id: string;
  auteur_nom: string;
};

export default function GroupeChat({
  groupeId,
  messages: initial,
  currentUserId,
  currentNom,
}: {
  groupeId: string;
  messages: Message[];
  currentUserId: string;
  currentNom: string;
}) {
  const [messages, setMessages] = useState(initial);
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!contenu.trim() || sending) return;
    setSending(true);
    const text = contenu.trim();
    setContenu("");
    // Optimistic update
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      contenu: text,
      created_at: new Date().toISOString(),
      auteur_id: currentUserId,
      auteur_nom: currentNom,
    }]);
    await sendGroupeMessage(groupeId, text);
    setSending(false);
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }

  // Grouper par date
  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const date = new Date(msg.created_at).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Aucun message. Soyez le premier à écrire !</p>
          </div>
        )}
        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 shrink-0">{formatDate(msgs[0].created_at)}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            {msgs.map((msg) => {
              const isMe = msg.auteur_id === currentUserId;
              return (
                <div key={msg.id} className={`flex gap-2 mb-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-1"
                    style={isMe
                      ? { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }
                      : { background: "#e5e7eb", color: "#374151" }}>
                    {msg.auteur_nom.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {!isMe && <p className="text-[10px] text-gray-400 mb-0.5 px-1">{msg.auteur_nom}</p>}
                    <div className="rounded-2xl px-3.5 py-2 text-sm"
                      style={isMe
                        ? { background: "linear-gradient(135deg, #0B1120, #1a2540)", color: "#fff" }
                        : { background: "#f3f4f6", color: "#111827" }}>
                      {msg.contenu}
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5 px-1">{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-100 px-4 py-3 flex gap-2">
        <input
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition"
        />
        <button
          type="submit"
          disabled={!contenu.trim() || sending}
          className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
