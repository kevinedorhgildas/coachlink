"use client";

import { useState, useRef } from "react";
import { useFormState } from "react-dom";
import { uploadDocument, deleteDocument } from "./actions";

type Document = {
  id: string;
  nom: string;
  url: string;
  created_at: string;
};

export default function DocumentsManager({ documents }: { documents: Document[] }) {
  const [liste, setListe] = useState(documents);
  const [suppression, setSuppression] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [state, formAction] = useFormState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      const res = await uploadDocument(formData);
      if (res.success) {
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
      }
      return res;
    },
    undefined
  );

  const handleDelete = async (id: string, url: string) => {
    setSuppression(id);
    await deleteDocument(id, url);
    setListe((prev) => prev.filter((d) => d.id !== id));
    setSuppression(null);
  };

  return (
    <div className="space-y-6">
      {/* Formulaire upload */}
      <form action={formAction} className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Ajouter un document PDF</h3>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Nom du document</label>
          <input
            name="nom"
            type="text"
            required
            placeholder="Ex. Programme musculation 8 semaines, Cours de nutrition..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Fichier PDF (max 10 Mo)</label>
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-8 transition hover:border-blue-400"
            onClick={() => fileRef.current?.click()}
          >
            {fileName ? (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span className="text-2xl">📄</span>
                <span className="font-medium">{fileName}</span>
              </div>
            ) : (
              <>
                <span className="text-3xl text-gray-300">📄</span>
                <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner un PDF</p>
                <p className="text-xs text-gray-400">Format PDF uniquement · 10 Mo max</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            name="fichier"
            type="file"
            accept="application/pdf"
            required
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </div>

        {state?.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state?.success && (
          <p className="mb-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Document ajouté avec succès.</p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Envoyer le document
        </button>
      </form>

      {/* Liste des documents */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Mes documents ({liste.length})
        </h3>

        {liste.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun document pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {liste.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900 text-sm">{doc.nom}</p>
                  <p className="text-xs text-gray-400">
                    Ajouté le {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Voir
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.url)}
                    disabled={suppression === doc.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {suppression === doc.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
