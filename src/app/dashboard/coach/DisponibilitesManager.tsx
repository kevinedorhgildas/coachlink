"use client";

import { useFormState } from "react-dom";
import { addDisponibilite, deleteDisponibilite } from "./actions";

const GOLD = "#C9A96E";
const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const inputCls = "rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition";

type Disponibilite = {
  id: string;
  jour_semaine: string;
  heure_debut: string;
  heure_fin: string;
};

export default function DisponibilitesManager({ disponibilites }: { disponibilites: Disponibilite[] }) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await addDisponibilite(formData);
    },
    undefined
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Disponibilités</h2>

      <ul className="mb-5 space-y-2">
        {disponibilites.length === 0 && (
          <li className="rounded-xl px-4 py-3 text-sm text-gray-400" style={{ background: `${GOLD}08` }}>Aucun créneau renseigné.</li>
        )}
        {disponibilites.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
            style={{ background: `${GOLD}0d`, borderLeft: `3px solid ${GOLD}66` }}
          >
            <span className="capitalize font-medium text-gray-800">
              {d.jour_semaine} — <span style={{ color: "#9A7A2E" }}>{d.heure_debut.slice(0, 5)} – {d.heure_fin.slice(0, 5)}</span>
            </span>
            <button
              onClick={() => deleteDisponibilite(d.id)}
              className="text-xs text-red-400 hover:text-red-600 transition"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Jour</label>
          <select name="jour_semaine" required className={inputCls}>
            {JOURS.map((j) => (
              <option key={j} value={j} className="capitalize">{j}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">De</label>
          <input name="heure_debut" type="time" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">À</label>
          <input name="heure_fin" type="time" required className={inputCls} />
        </div>
        <button
          type="submit"
          className="rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
        >
          + Ajouter
        </button>
      </form>

      {state?.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
    </div>
  );
}
