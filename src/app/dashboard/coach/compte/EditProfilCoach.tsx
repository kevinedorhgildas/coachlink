"use client";

import { useState, useTransition } from "react";
import { updateProfilCoach } from "@/app/dashboard/actions-profil";

const GOLD = "#C9A96E";

const SPECIALITES = [
  "Coach sportif", "Coach mental", "Coach bien-être", "Coach business",
  "Coach développement personnel", "Coach nutrition", "Coach de vie",
  "Coach en séduction", "Coach en langues", "Coach financier",
  "Coach en immobilier", "Coach en E-commerce", "Nutritionniste", "Autre",
];

type Props = {
  nom: string;
  ville: string;
  specialite: string;
  tarif_horaire: number;
  description: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
};

export default function EditProfilCoach({ nom, ville, specialite, tarif_horaire, description, instagram, tiktok, snapchat, facebook, x, youtube }: Props) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateProfilCoach(fd);
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

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Spécialité</label>
                <select name="specialite" defaultValue={specialite}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]">
                  {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tarif horaire (€)</label>
                <input name="tarif_horaire" type="number" min="0" defaultValue={tarif_horaire}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]"
                  placeholder="50" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea name="description" defaultValue={description} rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E] resize-none"
                  placeholder="Présentez-vous en quelques mots…" />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Réseaux sociaux</p>
                {[
                  { name: "instagram", icon: "📸", placeholder: "https://instagram.com/tonprofil", defaultValue: instagram },
                  { name: "tiktok", icon: "🎵", placeholder: "https://tiktok.com/@tonprofil", defaultValue: tiktok },
                  { name: "youtube", icon: "▶️", placeholder: "https://youtube.com/@tachaîne", defaultValue: youtube },
                  { name: "snapchat", icon: "👻", placeholder: "https://snapchat.com/add/tonprofil", defaultValue: snapchat },
                  { name: "facebook", icon: "👤", placeholder: "https://facebook.com/tonprofil", defaultValue: facebook },
                  { name: "x", icon: "𝕏", placeholder: "https://x.com/tonprofil", defaultValue: x },
                ].map(({ name, icon, placeholder, defaultValue }) => (
                  <div key={name} className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{icon} {name === "x" ? "X (Twitter)" : name.charAt(0).toUpperCase() + name.slice(1)}</label>
                    <input name={name} defaultValue={defaultValue ?? ""} type="url"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]"
                      placeholder={placeholder} />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nouveau mot de passe <span className="font-normal text-gray-400">(laisser vide pour ne pas changer)</span></label>
                <div className="relative">
                  <input name="new_password" type={showPassword ? "text" : "password"} minLength={6}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A96E]"
                    placeholder="6 caractères minimum" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
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
