"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { uploadMedia, deleteMedia, addTemoignage, deleteTemoignage } from "./actions";

type Media = { id: string; type: string; url: string; legende: string | null; created_at: string };
type Temoignage = { id: string; auteur: string; contenu: string; note: number | null; created_at: string };

export default function VitrineManager({
  medias,
  temoignages,
  coachId,
}: {
  medias: Media[];
  temoignages: Temoignage[];
  coachId: string;
}) {
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
    { key: "photos" as const, label: "Photos", icon: "🖼️", count: photos.length },
    { key: "videos" as const, label: "Vidéos", icon: "🎬", count: videos.length },
    { key: "temoignages" as const, label: "Témoignages", icon: "💬", count: temoList.length },
  ];

  const accept = activeTab === "photos" ? "image/*" : "video/*";
  const acceptLabel = activeTab === "photos" ? "JPG, PNG, WEBP · 50 Mo max" : "MP4, MOV, WEBM · 50 Mo max";

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setUploadError(null); setUploadSuccess(false); }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeTab === tab.key ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Photos / Vidéos */}
      {(activeTab === "photos" || activeTab === "videos") && (
        <>
          <form onSubmit={handleMediaUpload} className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              {activeTab === "photos" ? "Ajouter une photo" : "Ajouter une vidéo"}
            </h3>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">Légende (optionnelle)</label>
              <input name="legende" type="text" placeholder="Ex. Séance de coaching en plein air..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div
              className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 transition hover:border-emerald-400"
              onClick={() => fileRef.current?.click()}
            >
              {fileName ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <span className="text-2xl">{activeTab === "photos" ? "🖼️" : "🎬"}</span>
                  <span className="font-medium">{fileName}</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl text-gray-300">{activeTab === "photos" ? "🖼️" : "🎬"}</span>
                  <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner un fichier</p>
                  <p className="text-xs text-gray-400">{acceptLabel}</p>
                </>
              )}
            </div>
            <input ref={fileRef} name="fichier" type="file" accept={accept} required className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
            {uploadError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</p>}
            {uploadSuccess && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Fichier ajouté avec succès ✓</p>}
            <button type="submit" disabled={uploading} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {uploading ? "Envoi en cours..." : "Envoyer"}
            </button>
          </form>

          {/* Galerie */}
          {activeTab === "photos" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700">Mes photos ({photos.length})</p>
              {photos.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune photo pour le moment.</p>
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

          {activeTab === "videos" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Mes vidéos ({videos.length})</p>
                {videos.length > 0 && (
                  <Link href={`/coachs/${coachId}/videos`} target="_blank" className="text-xs font-medium text-emerald-600 hover:underline">
                    ⛶ Voir en plein écran →
                  </Link>
                )}
              </div>
              {videos.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune vidéo pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {videos.map((m) => (
                    <div key={m.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      <video src={m.url} controls className="w-full max-h-64 bg-black" />
                      <div className="flex items-center justify-between px-3 py-2">
                        <p className="text-sm text-gray-600">{m.legende ?? "Vidéo sans légende"}</p>
                        <button onClick={() => handleDeleteMedia(m.id, m.url)} className="text-xs text-red-500 hover:underline">Supprimer</button>
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
          <form ref={temoFormRef} onSubmit={handleTemoignage} className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Ajouter un témoignage</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Nom de l'élève *</label>
              <input name="auteur" type="text" required placeholder="Ex. Marie D." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Témoignage *</label>
              <textarea name="contenu" required rows={3} placeholder="Ce que l'élève a dit..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Note (optionnelle)</label>
              <select name="note" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                <option value="">— Sans note —</option>
                <option value="5">⭐⭐⭐⭐⭐ — Excellent</option>
                <option value="4">⭐⭐⭐⭐ — Très bien</option>
                <option value="3">⭐⭐⭐ — Bien</option>
                <option value="2">⭐⭐ — Moyen</option>
                <option value="1">⭐ — Décevant</option>
              </select>
            </div>
            {temoError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{temoError}</p>}
            {temoSuccess && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Témoignage ajouté ✓</p>}
            <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Ajouter
            </button>
          </form>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">Témoignages ({temoList.length})</p>
            {temoList.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun témoignage pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {temoList.map((t) => (
                  <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{t.auteur}</p>
                          {t.note && <span className="text-sm">{"⭐".repeat(t.note)}</span>}
                        </div>
                        <p className="text-sm text-gray-600 italic">"{t.contenu}"</p>
                        <p className="mt-1 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <button onClick={() => handleDeleteTemo(t.id)} className="shrink-0 text-xs text-red-400 hover:underline">Supprimer</button>
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
