"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { uploadMedia, deleteMedia, addTemoignage, deleteTemoignage } from "./actions";

const GOLD = "#C9A96E";
const inputCls = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition";

type Media = { id: string; type: string; url: string; legende: string | null; created_at: string };
type Temoignage = { id: string; auteur: string; contenu: string; note: number | null; created_at: string };

export default function VitrineManager({ medias, temoignages, coachId }: { medias: Media[]; temoignages: Temoignage[]; coachId: string }) {
  const [mediaList, setMediaList] = useState(medias);
  const [temoList, setTemoList] = useState(temoignages);
  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "temoignages">("photos");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [temoError, setTemoError] = useState<string | null>(null);
  const [temoSuccess, setTemoSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const temoFormRef = useRef<HTMLFormElement>(null);

  const handleMediaUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    const formData = new FormData(e.currentTarget);
    formData.set("type", activeTab === "photos" ? "photo" : "video");
    const res = await uploadMedia(formData);
    if (res?.error) {
      setUploadError(res.error);
    } else {
      setUploadSuccess(true);
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setUploadSuccess(false), 3000);
    }
    setUploading(false);
  };

  const handleDeleteMedia = async (id: string, url: string) => {
    await deleteMedia(id, url);
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleTemoignage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTemoError(null);
    setTemoSuccess(false);
    const formData = new FormData(e.currentTarget);
    const res = await addTemoignage(formData);
    if (res?.error) {
      setTemoError(res.error);
    } else {
      setTemoSuccess(true);
      temoFormRef.current?.reset();
      setTimeout(() => setTemoSuccess(false), 3000);
    }
  };

  const handleDeleteTemo = async (id: string) => {
    await deleteTemoignage(id);
    setTemoList((prev) => prev.filter((t) => t.id !== id));
  };

  const photos = mediaList.filter((m) => m.type === "photo");
  const videos = mediaList.filter((m) => m.type === "video");

  const tabs = [
    { key: "photos" as const,      label: "Photos",       icon: "🖼️", count: photos.length },
    { key: "videos" as const,      label: "Vidéos",       icon: "🎬", count: videos.length },
    { key: "temoignages" as const, label: "Témoignages",  icon: "💬", count: temoList.length },
  ];

  const accept = activeTab === "photos" ? "image/*" : "video/*";
  const acceptLabel = activeTab === "photos" ? "JPG, PNG, WEBP · 50 Mo max" : "MP4, MOV, WEBM · 50 Mo max";

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setUploadError(null); setUploadSuccess(false); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
            style={activeTab === tab.key
              ? { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }
              : { color: "#6b7280" }}
          >
            <span>{tab.icon}</span>
            {tab.label}
            <span className="rounded-full px-1.5 py-0.5 text-xs font-bold" style={activeTab === tab.key ? { background: "#0B112022", color: "#0B1120" } : { background: "#e5e7eb", color: "#6b7280" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Photos / Vidéos */}
      {(activeTab === "photos" || activeTab === "videos") && (
        <>
          <form onSubmit={handleMediaUpload} className="rounded-2xl border border-dashed p-5" style={{ borderColor: `${GOLD}66`, background: `${GOLD}06` }}>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              {activeTab === "photos" ? "Ajouter une photo" : "Ajouter une vidéo"}
            </h3>
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Légende (optionnelle)</label>
              <input name="legende" type="text" placeholder="Ex. Séance de coaching en plein air..." className={inputCls} />
            </div>
            <div
              className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-4 py-8 transition"
              style={{ borderColor: fileName ? GOLD : "#e5e7eb" }}
              onClick={() => fileRef.current?.click()}
            >
              {fileName ? (
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#9A7A2E" }}>
                  <span className="text-2xl">{activeTab === "photos" ? "🖼️" : "🎬"}</span>
                  <span>{fileName}</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl" style={{ opacity: 0.35 }}>{activeTab === "photos" ? "🖼️" : "🎬"}</span>
                  <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner un fichier</p>
                  <p className="text-xs text-gray-400">{acceptLabel}</p>
                </>
              )}
            </div>
            <input ref={fileRef} name="fichier" type="file" accept={accept} required className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
            {uploadError && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</p>}
            {uploadSuccess && <p className="mb-3 rounded-xl px-3 py-2 text-sm font-medium" style={{ background: `${GOLD}11`, color: "#9A7A2E" }}>✓ Fichier ajouté avec succès</p>}
            <button type="submit" disabled={uploading} className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              {uploading ? "Envoi en cours…" : "Envoyer"}
            </button>
          </form>

          {/* Galerie photos */}
          {activeTab === "photos" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Mes photos <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{photos.length}</span>
              </p>
              {photos.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
                  <p className="text-sm text-gray-400">Aucune photo pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((m) => (
                    <div key={m.id} className="group relative overflow-hidden rounded-xl border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.legende ?? ""} className="h-40 w-full object-cover" />
                      {m.legende && <p className="truncate bg-white px-2 py-1 text-xs text-gray-600">{m.legende}</p>}
                      <button onClick={() => handleDeleteMedia(m.id, m.url)} className="absolute right-2 top-2 hidden rounded-full bg-red-600 px-2 py-1 text-xs text-white group-hover:block">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Galerie vidéos */}
          {activeTab === "videos" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  Mes vidéos <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{videos.length}</span>
                </p>
                {videos.length > 0 && (
                  <Link href={`/coachs/${coachId}/videos`} target="_blank" className="text-xs font-medium transition hover:opacity-70" style={{ color: GOLD }}>
                    ⛶ Voir en plein écran →
                  </Link>
                )}
              </div>
              {videos.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
                  <p className="text-sm text-gray-400">Aucune vidéo pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((m) => (
                    <div key={m.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      <video src={m.url} controls className="w-full max-h-64 bg-black" />
                      <div className="flex items-center justify-between px-3 py-2">
                        <p className="text-sm text-gray-600">{m.legende ?? "Vidéo sans légende"}</p>
                        <button onClick={() => handleDeleteMedia(m.id, m.url)} className="text-xs text-red-400 hover:text-red-600 transition">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Témoignages */}
      {activeTab === "temoignages" && (
        <>
          <form ref={temoFormRef} onSubmit={handleTemoignage} className="rounded-2xl border border-dashed p-5 space-y-4" style={{ borderColor: `${GOLD}66`, background: `${GOLD}06` }}>
            <h3 className="text-sm font-semibold text-gray-700">Ajouter un témoignage</h3>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Nom de l'élève *</label>
              <input name="auteur" type="text" required placeholder="Ex. Marie D." className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Témoignage *</label>
              <textarea name="contenu" required rows={3} placeholder="Ce que l'élève a dit..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Note (optionnelle)</label>
              <select name="note" className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition">
                <option value="">— Sans note —</option>
                <option value="5">⭐⭐⭐⭐⭐ — Excellent</option>
                <option value="4">⭐⭐⭐⭐ — Très bien</option>
                <option value="3">⭐⭐⭐ — Bien</option>
                <option value="2">⭐⭐ — Moyen</option>
                <option value="1">⭐ — Décevant</option>
              </select>
            </div>
            {temoError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{temoError}</p>}
            {temoSuccess && <p className="rounded-xl px-3 py-2 text-sm font-medium" style={{ background: `${GOLD}11`, color: "#9A7A2E" }}>✓ Témoignage ajouté</p>}
            <button type="submit" className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              Ajouter
            </button>
          </form>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Témoignages <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{temoList.length}</span>
            </p>
            {temoList.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
                <p className="text-sm text-gray-400">Aucun témoignage pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {temoList.map((t) => (
                  <div key={t.id} className="rounded-2xl border p-4" style={{ borderColor: `${GOLD}33`, background: `${GOLD}08` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{t.auteur}</p>
                          {t.note && <span className="text-sm" style={{ color: GOLD }}>{"★".repeat(t.note)}{"☆".repeat(5 - t.note)}</span>}
                        </div>
                        <p className="text-sm text-gray-600 italic">"{t.contenu}"</p>
                        <p className="mt-1 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <button onClick={() => handleDeleteTemo(t.id)} className="shrink-0 text-xs text-red-400 hover:text-red-600 transition">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
