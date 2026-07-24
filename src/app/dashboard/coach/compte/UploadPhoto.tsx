"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPhotoCoach } from "@/app/dashboard/actions-profil";

const GOLD = "#C9A96E";

export default function UploadPhoto({ photoUrl, initiale }: { photoUrl?: string; initiale: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Fichier trop lourd (max 5 Mo)"); return; }
    setError(null);
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("photo", file);
    startTransition(async () => {
      try {
        await uploadPhotoCoach(fd);
      } catch {
        setError("Erreur lors de l'upload");
      }
    });
  }

  return (
    <div className="relative group w-fit">
      <div
        className="h-16 w-16 shrink-0 overflow-hidden rounded-full cursor-pointer"
        style={{ outline: `2px solid ${GOLD}44` }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            {initiale}
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition">
          {isPending ? (
            <span className="text-white text-xs">...</span>
          ) : (
            <span className="text-white text-lg">+</span>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {error && <p className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">{error}</p>}
    </div>
  );
}
