"use client";

import { useState, useRef } from "react";
import { useFormState } from "react-dom";
import { uploadDocument, deleteDocument } from "./actions";

const GOLD = "#C9A96E";

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
      <form action={formAction} className="rounded-2xl border border-dashed p-6" style={{ borderColor: `${GOLD}66`, background: `${GOLD}06` }}>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Ajouter un document PDF</h3>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Nom du document</label>
          <input
            name="nom"
            type="text"
            required
            placeholder="Ex. Programme musculation 8 semaines, Cours de nutrition..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Fichier PDF (max 10 Mo)</label>
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-4 py-8 transition hover:border-[#C9A96E]"
            style={{ borderColor: fileName ? GOLD : "#e5e7eb" }}
            onClick={() => fileRef.current?.click()}
          >
            {fileName ? (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#9A7A2E" }}>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C9A96E" }}>PDF</span>
                <span>{fileName}</span>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-300">PDF</span>
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
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state?.success && (
          <p className="mb-3 rounded-xl px-4 py-2 text-sm font-medium" style={{ background: `${GOLD}11`, color: "#9A7A2E" }}>✓ Document ajouté avec succès.</p>
        )}

        <button
          type="submit"
          className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
        >
          Envoyer le document
        </button>
      </form>

      {/* Liste des documents */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Mes documents{" "}
          <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${GOLD}22`, color: "#9A7A2E" }}>{liste.length}</span>
        </h3>

        {liste.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            
            <p className="text-sm text-gray-400">Aucun document pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {liste.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-gray-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${GOLD}15` }}><span className="text-xs font-bold uppercase" style={{ color: "#C9A96E" }}>PDF</span></div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-gray-900 text-sm">{doc.nom}</p>
                  <p className="text-xs text-gray-400">
                    Ajouté le {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                    style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}
                  >
                    Voir
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.url)}
                    disabled={suppression === doc.id}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {suppression === doc.id ? "…" : "Supprimer"}
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
