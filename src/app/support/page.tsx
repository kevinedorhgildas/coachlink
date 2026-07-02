"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { contactSupport } from "./actions";

export default function SupportPage() {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await contactSupport(formData);
    },
    undefined
  );

  const sujets = [
    "Problème de connexion / inscription",
    "Problème avec une réservation",
    "Signaler un coach",
    "Signaler un client",
    "Problème technique",
    "Question sur la plateforme",
    "Autre",
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Service client</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>

      {/* Bloc contact rapide */}
      <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 px-6 py-5">
        <h2 className="mb-1 text-sm font-semibold text-blue-800">Contactez-nous directement</h2>
        <p className="text-sm text-blue-700">
          Pour toute demande, écrivez-nous à{" "}
          <a href="mailto:contact@coachlink.fr" className="font-medium underline hover:text-blue-900">
            contact@coachlink.fr
          </a>
          . Nous répondons sous 24 à 48h ouvrées.
        </p>
      </div>

      {/* Formulaire */}
      {state?.success ? (
        <div className="rounded-lg bg-green-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-green-800">Message envoyé !</p>
          <p className="mt-2 text-sm text-green-700">
            Nous avons bien reçu votre demande et vous répondrons sous 24 à 48h ouvrées.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Envoyer un message</h2>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
              <input
                name="nom"
                type="text"
                required
                placeholder="Votre nom"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="Votre email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sujet</label>
            <select
              name="sujet"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Choisissez un sujet --</option>
              {sujets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              rows={5}
              required
              placeholder="Décrivez votre problème ou question..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Envoyer le message
          </button>
        </form>
      )}

      {/* Lien FAQ */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Consultez d'abord notre{" "}
        <Link href="/faq" className="font-medium text-blue-600 hover:underline">
          Foire aux questions
        </Link>{" "}
        — votre réponse s'y trouve peut-être.
      </p>
    </main>
  );
}
