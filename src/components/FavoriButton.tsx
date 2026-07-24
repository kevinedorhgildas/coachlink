"use client";

import { useTransition } from "react";
import { toggleFavori } from "@/app/dashboard/client/actions";

export default function FavoriButton({ coachId, isFavori }: { coachId: string; isFavori: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => toggleFavori(coachId));
      }}
      disabled={pending}
      title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="shrink-0 text-xl transition-transform hover:scale-110 disabled:opacity-50"
    >
      {isFavori ? "★" : "☆"}
    </button>
  );
}
