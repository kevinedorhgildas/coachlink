"use client";

import { useState } from "react";

type Photo = { id: string; url: string; legende: string | null };

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = (i: number) => setActiveIndex(i);
  const close = () => setActiveIndex(null);
  const prev = () => setActiveIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0));
  const next = () => setActiveIndex((i) => (i !== null ? (i + 1) % photos.length : 0));

  const active = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <>
      {/* Grille */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => open(i)}
            className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.legende ?? ""} className="h-44 w-full object-cover transition group-hover:scale-105 group-hover:opacity-90" />
            {photo.legende && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                <p className="truncate text-xs text-white">{photo.legende}</p>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
              <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">🔍 Agrandir</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
        >
          {/* Fermer */}
          <button onClick={close} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 text-xl">✕</button>

          {/* Précédent */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 text-xl"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div className="max-h-[90vh] max-w-[90vw] text-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt={active.legende ?? ""} className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" />
            {active.legende && <p className="mt-3 text-sm text-gray-300">{active.legende}</p>}
            <p className="mt-1 text-xs text-gray-600">{(activeIndex ?? 0) + 1} / {photos.length}</p>
          </div>

          {/* Suivant */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 text-xl"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
