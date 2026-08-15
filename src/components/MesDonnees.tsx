"use client";

import { useState, useTransition } from "react";
import { supprimerMonCompte } from "@/app/dashboard/actions-rgpd";

const GOLD = "#C9A96E";

/** Le mot à recopier pour armer la suppression. */
const CONFIRMATION = "SUPPRIMER";

/**
 * Le bloc « Mes données » des pages de compte : export et suppression.
 *
 * La suppression demande de recopier un mot plutôt qu'un simple clic de
 * confirmation. C'est irréversible et ça part sans préavis — un `confirm()`
 * se clique par réflexe, recopier un mot demande de lire.
 */
export default function MesDonnees() {
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const arme = saisie.trim().toUpperCase() === CONFIRMATION;

  const supprimer = () => {
    setErreur(null);
    demarrer(async () => {
      const resultat = await supprimerMonCompte();
      // En cas de succès l'action redirige : on n'arrive ici que sur échec.
      if (resultat?.error) setErreur(resultat.error);
    });
  };

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold text-gray-900">Mes données</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Vous pouvez récupérer une copie de vos données ou supprimer définitivement votre
          compte, conformément au RGPD.
        </p>
      </div>

      <a
        href="/api/mes-donnees"
        className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 transition hover:bg-gray-50"
      >
        <span>
          Télécharger mes données
          <span className="mt-0.5 block text-xs text-gray-400">Fichier JSON</span>
        </span>
        <span className="text-xs text-gray-300">↓</span>
      </a>

      <div className="border-t border-gray-100">
        {!ouvert ? (
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="flex w-full items-center px-5 py-3.5 text-left text-sm text-red-500 transition hover:bg-red-50"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-red-600">
              Cette action est définitive.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
              Votre profil, vos réservations, vos messages, vos fichiers et votre inscription
              à la newsletter seront effacés immédiatement et sans possibilité de retour.
              Pensez à télécharger vos données avant de continuer.
            </p>

            <label htmlFor="confirmation" className="mt-4 block text-xs font-medium text-gray-700">
              Tapez <span className="font-bold">{CONFIRMATION}</span> pour confirmer
            </label>
            <input
              id="confirmation"
              type="text"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              autoComplete="off"
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />

            {erreur && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {erreur}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={supprimer}
                disabled={!arme || enCours}
                className="rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "#dc2626" }}
              >
                {enCours ? "Suppression…" : "Supprimer définitivement"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOuvert(false);
                  setSaisie("");
                  setErreur(null);
                }}
                disabled={enCours}
                className="rounded-full px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                style={{ borderColor: GOLD }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
