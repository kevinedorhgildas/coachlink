"use client";

import { useState } from "react";
import { toggleLike, addCommentaire } from "@/app/dashboard/coach/publications/actions";

const GOLD = "#C9A96E";

type Commentaire = { id: string; contenu: string; created_at: string; auteur_nom: string };
type Publication = {
  id: string;
  contenu: string;
  media_url: string | null;
  type: string;
  created_at: string;
  coach_nom: string;
  coach_photo: string | null;
  coach_id: string;
  nb_likes: number;
  liked_by_me: boolean;
  commentaires: Commentaire[];
};

export default function PublicationCard({ pub, currentUserId, isCoach = false, onDelete }: {
  pub: Publication;
  currentUserId: string | null;
  isCoach?: boolean;
  onDelete?: (id: string) => void;
}) {
  const [liked, setLiked] = useState(pub.liked_by_me);
  const [nbLikes, setNbLikes] = useState(pub.nb_likes);
  const [commentaires, setCommentaires] = useState(pub.commentaires);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  async function handleLike() {
    if (!currentUserId) return;
    setLiked((v) => !v);
    setNbLikes((n) => liked ? n - 1 : n + 1);
    await toggleLike(pub.id);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || sending) return;
    setSending(true);
    const text = newComment.trim();
    setNewComment("");
    setCommentaires((prev) => [...prev, {
      id: crypto.randomUUID(),
      contenu: text,
      created_at: new Date().toISOString(),
      auteur_nom: "Vous",
    }]);
    await addCommentaire(pub.id, text);
    setSending(false);
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ outline: `2px solid ${GOLD}44` }}>
            {pub.coach_photo
              ? <img src={pub.coach_photo} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-sm font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                  {pub.coach_nom.charAt(0).toUpperCase()}
                </div>}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{pub.coach_nom}</p>
            <p className="text-xs text-gray-400">{timeAgo(pub.created_at)}</p>
          </div>
        </div>
        {isCoach && onDelete && (
          <button onClick={() => onDelete(pub.id)} className="text-xs text-gray-300 hover:text-red-400 transition px-2">✕</button>
        )}
      </div>

      {/* Contenu texte */}
      <div className="px-5 pb-3">
        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{pub.contenu}</p>
      </div>

      {/* Média */}
      {pub.media_url && (
        <div className="border-t border-gray-50">
          {pub.type === "video"
            ? <video src={pub.media_url} controls className="w-full max-h-80 object-cover bg-black" />
            : <img src={pub.media_url} alt="" className="w-full max-h-80 object-cover" />}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-gray-100 px-5 py-3">
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70 disabled:opacity-40"
          style={{ color: liked ? "#dc2626" : "#9ca3af" }}
        >
          <span className="text-base">{liked ? "❤️" : "🤍"}</span>
          <span>{nbLikes}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-gray-600"
        >
          <span className="text-base">💬</span>
          <span>{commentaires.length}</span>
        </button>
      </div>

      {/* Commentaires */}
      {showComments && (
        <div className="border-t border-gray-100 px-5 pb-4">
          <div className="space-y-3 pt-3 max-h-48 overflow-y-auto">
            {commentaires.length === 0 && <p className="text-xs text-gray-400">Aucun commentaire.</p>}
            {commentaires.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="h-6 w-6 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {c.auteur_nom.charAt(0).toUpperCase()}
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-1.5 text-xs">
                  <span className="font-semibold text-gray-700 mr-1">{c.auteur_nom}</span>
                  <span className="text-gray-600">{c.contenu}</span>
                </div>
              </div>
            ))}
          </div>
          {currentUserId && (
            <form onSubmit={handleComment} className="mt-3 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#C9A96E] transition"
              />
              <button type="submit" disabled={!newComment.trim() || sending}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                Envoyer
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
