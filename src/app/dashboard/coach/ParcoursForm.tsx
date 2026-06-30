"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { updateCoachParcours } from "./actions";

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
    <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Parcours professionnel</h2>

      {/* Diplômes */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Diplômes</h3>
        <ul className="mb-3 space-y-1">
          {diplomes.map((d, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {d}
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
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="button" onClick={addDiplome} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + Ajouter
          </button>
        </div>
      </div>

      {/* Compétences */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Compétences</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {competences.map((c, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
              {c}
              <button type="button" onClick={() => setCompetences(competences.filter((_, j) => j !== i))} className="text-blue-400 hover:text-blue-600">✕</button>
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
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="button" onClick={addCompetence} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + Ajouter
          </button>
        </div>
      </div>

      {/* Expériences */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Expériences professionnelles</h3>
        <div className="mb-3 space-y-3">
          {experiences.map((exp, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{exp.titre}</p>
                  {exp.entreprise && <p className="text-gray-600">{exp.entreprise}{exp.duree ? ` · ${exp.duree}` : ""}</p>}
                  {exp.description && <p className="mt-1 text-gray-500">{exp.description}</p>}
                </div>
                <button type="button" onClick={() => setExperiences(experiences.filter((_, j) => j !== i))} className="ml-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 rounded-lg border border-dashed border-gray-300 p-3">
          <input
            type="text"
            value={newExp.titre}
            onChange={(e) => setNewExp({ ...newExp, titre: e.target.value })}
            placeholder="Titre du poste *"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newExp.entreprise}
              onChange={(e) => setNewExp({ ...newExp, entreprise: e.target.value })}
              placeholder="Entreprise / Structure"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={newExp.duree}
              onChange={(e) => setNewExp({ ...newExp, duree: e.target.value })}
              placeholder="Durée (ex. 2 ans)"
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <textarea
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            placeholder="Description (optionnel)"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="button" onClick={addExperience} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + Ajouter cette expérience
          </button>
        </div>
      </div>

      {/* Champs cachés + submit */}
      <form action={formAction}>
        <input type="hidden" name="diplomes" value={JSON.stringify(diplomes)} />
        <input type="hidden" name="competences" value={JSON.stringify(competences)} />
        <input type="hidden" name="experiences" value={JSON.stringify(experiences)} />

        {state?.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state?.success && (
          <p className="mb-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Parcours mis à jour avec succès.</p>
        )}

        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          Enregistrer le parcours
        </button>
      </form>
    </section>
  );
}
