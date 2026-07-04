"use client";

import { useFormState } from "react-dom";
import { updateCoachProfile } from "./actions";

const GOLD = "#C9A96E";

const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#C9A96E] transition";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

type Coach = {
  specialite: string | null;
  ville: string | null;
  tarif_horaire: number | null;
  tarif_individuel?: number | null;
  tarif_groupe?: number | null;
  tarif_enligne?: number | null;
  description: string | null;
};

export default function ProfileForm({ coach }: { coach: Coach }) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await updateCoachProfile(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Informations du profil</h2>

      <div>
        <label htmlFor="specialite" className={labelCls}>Domaine du coach</label>
        <input
          id="specialite"
          name="specialite"
          type="text"
          defaultValue={coach.specialite ?? ""}
          required
          placeholder="Rechercher ou saisir un domaine..."
          list="domaines-list"
          className={inputCls}
        />
        <datalist id="domaines-list">
          <option value="Coach sportif" />
          <option value="Coach en finance" />
          <option value="Coach en développement personnel" />
          <option value="Coach marketing" />
          <option value="Coach en développement business" />
          <option value="Coach mental" />
          <option value="Coach en séduction" />
          <option value="Coach en bien être et santé" />
          <option value="Coach en langue" />
        </datalist>
      </div>

      <div>
        <label htmlFor="ville" className={labelCls}>Ville</label>
        <input
          id="ville"
          name="ville"
          type="text"
          defaultValue={coach.ville ?? ""}
          required
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="tarif_horaire" className={labelCls}>Tarif horaire général (€)</label>
        <input id="tarif_horaire" name="tarif_horaire" type="number" min={0} step="0.5" defaultValue={coach.tarif_horaire ?? ""} className={inputCls} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "tarif_individuel", label: "Individuel (€)", val: coach.tarif_individuel, icon: "👤" },
          { key: "tarif_groupe",     label: "Groupe (€)",     val: coach.tarif_groupe,     icon: "👥" },
          { key: "tarif_enligne",    label: "En ligne (€)",   val: coach.tarif_enligne,    icon: "💻" },
        ].map(({ key, label, val, icon }) => (
          <div key={key}>
            <label className={labelCls}>{icon} {label}</label>
            <input name={key} type="number" min={0} step="0.5" defaultValue={val ?? ""} placeholder="—" className={inputCls} />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={coach.description ?? ""}
          placeholder="Présentez votre expérience, votre approche..."
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-xl px-4 py-2 text-sm font-medium" style={{ background: `${GOLD}11`, color: "#9A7A2E" }}>
          ✓ Profil mis à jour avec succès.
        </p>
      )}

      <button
        type="submit"
        className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
      >
        Enregistrer
      </button>
    </form>
  );
}
