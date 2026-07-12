"use client";

import { useState } from "react";
import { createPublication } from "./actions";

const GOLD = "#C9A96E";

export default function NewPublicationForm({ coachNom, coachPhoto }: { coachNom: string; coachPhoto: string | null }) {
  const [contenu, setContenu] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contenu.trim()) return;
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.set("contenu", contenu);
    fd.set("media_url", mediaUrl);
    const res = await createPublication(fd);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setContenu("");
    setMediaUrl("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ outline: `2px solid ${GOLD}44` }}>
          {coachPhoto
            ? <img src={coachPhoto} alt="" className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center text-sm font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
                {coachNom.charAt(0).toUpperCase()}
              </div>}
        </div>
        <div className="flex-1">
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Partagez un conseil, une actualité, une photo..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition"
          />
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="URL d'une image ou vidéo (optionnel)"
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition text-gray-500"
          />
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!contenu.trim() || loading}
              className="rounded-xl px-5 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
            >
              {loading ? "Publication..." : "Publier"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
