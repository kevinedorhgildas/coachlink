"use client";

import { useState, useTransition } from "react";
import { updateProfilClient } from "@/app/dashboard/actions-profil";

const GOLD = "#C9A96E";

type Props = {
  nom: string;
  ville: string;
};

export default function EditProfilClient({ nom, ville }: Props) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateProfilClient(fd);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#5a3e00" }}>
        ✏️ Modifier mes infos
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Modifier mon profil</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom complet</label>
                <input name="nom" defaultValue={nom} required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
                <input name="ville" defaultValue={ville}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]"
                  placeholder="Paris, Lyon, Marseille…" />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nouveau mot de passe <span className="font-normal text-gray-400">(laisser vide pour ne pas changer)</span></label>
                <input name="new_password" type="password" minLength={6}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]"
                  placeholder="6 caractères minimum" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isPending}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#5a3e00" }}>
                  {success ? "✓ Enregistré !" : isPending ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border border-gray-200">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
