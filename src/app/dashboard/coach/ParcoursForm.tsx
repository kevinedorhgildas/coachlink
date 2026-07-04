"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { updateCoachParcours } from "./actions";

const GOLD = "#C9A96E";
const inputCls = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition";

type Experience = {
  titre: string;
  entreprise: string;
  duree: string;
  description: string;
};

type Parcours = {
  diplomes: string[];
  competences: string[];
  experiences: Experience[];
};

export default function ParcoursForm({ parcours }: { parcours: Parcours }) {
  const [diplomes, setDiplomes] = useState<string[]>(parcours.diplomes ?? []);
  const [competences, setCompetences] = useState<string[]>(parcours.competences ?? []);
  const [experiences, setExperiences] = useState<Experience[]>(parcours.experiences ?? []);

  const [newDiplome, setNewDiplome] = useState("");
  const [newCompetence, setNewCompetence] = useState("");
  const [newExp, setNewExp] = useState<Experience>({ titre: "", entreprise: "", duree: "", description: "" });

  const [state, formAction] = useFormState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await updateCoachParcours(formData);
    },
    undefined
  );

  const addDiplome = () => {
    if (!newDiplome.trim()) return;
    setDiplomes([...diplomes, newDiplome.trim()]);
    setNewDiplome("");
  };

  const addCompetence = () => {
    if (!newCompetence.trim()) return;
    setCompetences([...competences, newCompetence.trim()]);
    setNewCompetence("");
  };

  const addExperience = () => {
    if (!newExp.titre.trim()) return;
    setExperiences([...experiences, newExp]);
    setNewExp({ titre: "", entreprise: "", duree: "", description: "" });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Parcours professionnel</h2>

      {/* Diplômes */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Diplômes</h3>
        <ul className="mb-3 space-y-1.5">
          {diplomes.map((d, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-800" style={{ background: `${GOLD}0d` }}>
              <span>🎓 {d}</span>
              <button type="button" onClick={() => setDiplomes(diplomes.filter((_, j) => j !== i))} className="ml-2 text-red-400 hover:text-red-600">✕</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDiplome}
            onChange={(e) => setNewDiplome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDiplome())}
            placeholder="Ex. Master STAPS, BTS Commerce..."
            className={inputCls}
          />
          <button type="button" onClick={addDiplome} className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:opacity-80 shrink-0" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
            + Ajouter
          </button>
        </div>
      </div>

      {/* Compétences */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Compétences</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {competences.map((c, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
              {c}
              <button type="button" onClick={() => setCompetences(competences.filter((_, j) => j !== i))} className="hover:text-red-500 transition">✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCompetence}
            onChange={(e) => setNewCompetence(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetence())}
            placeholder="Ex. Gestion du stress, Comptabilité..."
            className={inputCls}
          />
          <button type="button" onClick={addCompetence} className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:opacity-80 shrink-0" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
            + Ajouter
          </button>
        </div>
      </div>

      {/* Expériences */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Expériences professionnelles</h3>
        <div className="mb-3 space-y-2">
          {experiences.map((exp, i) => (
            <div key={i} className="rounded-xl p-3 text-sm" style={{ background: `${GOLD}0d`, borderLeft: `3px solid ${GOLD}88` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{exp.titre}</p>
                  {exp.entreprise && <p className="text-gray-500">{exp.entreprise}{exp.duree ? ` · ${exp.duree}` : ""}</p>}
                  {exp.description && <p className="mt-1 italic text-gray-400">{exp.description}</p>}
                </div>
                <button type="button" onClick={() => setExperiences(experiences.filter((_, j) => j !== i))} className="ml-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 rounded-xl border border-dashed p-4" style={{ borderColor: `${GOLD}44` }}>
          <input
            type="text"
            value={newExp.titre}
            onChange={(e) => setNewExp({ ...newExp, titre: e.target.value })}
            placeholder="Titre du poste *"
            className={inputCls}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newExp.entreprise}
              onChange={(e) => setNewExp({ ...newExp, entreprise: e.target.value })}
              placeholder="Entreprise / Structure"
              className={inputCls}
            />
            <input
              type="text"
              value={newExp.duree}
              onChange={(e) => setNewExp({ ...newExp, duree: e.target.value })}
              placeholder="Durée (ex. 2 ans)"
              className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A96E] transition"
            />
          </div>
          <textarea
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            placeholder="Description (optionnel)"
            rows={2}
            className={inputCls}
          />
          <button type="button" onClick={addExperience} className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:opacity-80" style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}>
            + Ajouter cette expérience
          </button>
        </div>
      </div>

      {/* Submit */}
      <form action={formAction}>
        <input type="hidden" name="diplomes" value={JSON.stringify(diplomes)} />
        <input type="hidden" name="competences" value={JSON.stringify(competences)} />
        <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />

        {state?.error && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state?.success && (
          <p className="mb-3 rounded-xl px-4 py-2 text-sm font-medium" style={{ background: `${GOLD}11`, color: "#9A7A2E" }}>✓ Parcours mis à jour avec succès.</p>
        )}

        <button type="submit" className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
          Enregistrer le parcours
        </button>
      </form>
    </section>
  );
}
