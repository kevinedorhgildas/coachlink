"use client";

import { useState } from "react";
import PublicationCard from "@/components/PublicationCard";
import { deletePublication } from "./actions";

type Pub = {
  id: string; contenu: string; media_url: string | null; type: string;
  created_at: string; coach_nom: string; coach_photo: string | null;
  coach_id: string; nb_likes: number; liked_by_me: boolean;
  commentaires: { id: string; contenu: string; created_at: string; auteur_nom: string }[];
};

export default function PublicationsFeed({ pubs: initial, currentUserId }: { pubs: Pub[]; currentUserId: string }) {
  const [pubs, setPubs] = useState(initial);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette publication ?")) return;
    await deletePublication(id);
    setPubs((prev) => prev.filter((p) => p.id !== id));
  }

  if (pubs.length === 0) return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <p className="text-3xl mb-3">📝</p>
      <p className="text-sm font-medium text-gray-500">Aucune publication pour l'instant.</p>
      <p className="text-xs text-gray-400 mt-1">Partagez des conseils, actualités ou photos avec vos clients.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {pubs.map((pub) => (
        <PublicationCard key={pub.id} pub={pub} currentUserId={currentUserId} isCoach onDelete={handleDelete} />
      ))}
    </div>
  );
}
