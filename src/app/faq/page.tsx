"use client";

import { useState } from "react";
import Link from "next/link";

const FAQ = [
  {
    question: "Qu'est-ce que CoachLink ?",
    reponse:
      "CoachLink est une plateforme qui met en relation des coachs professionnels et des clients dans tous les domaines : sport, finance, développement personnel, business, bien-être, langues, et bien plus encore.",
  },
  {
    question: "Comment trouver un coach ?",
    reponse:
      "Créez un compte client, puis accédez à votre tableau de bord. Vous pouvez rechercher un coach par domaine, ville ou tarif. Cliquez sur un profil pour voir ses disponibilités, son parcours et laisser une réservation.",
  },
  {
    question: "Comment devenir coach sur CoachLink ?",
    reponse:
      "Inscrivez-vous en choisissant le rôle « Coach ». Complétez ensuite votre profil : photo, domaine, tarif, description, diplômes, compétences, expériences et disponibilités. Votre profil sera visible publiquement par tous les clients.",
  },
  {
    question: "Comment fonctionne la réservation ?",
    reponse:
      "Le client choisit un créneau disponible sur le profil du coach et envoie une demande de réservation. Le coach reçoit la demande sur son tableau de bord et peut l'accepter ou la refuser. Le client est informé du statut depuis son tableau de bord.",
  },
  {
    question: "Est-ce que CoachLink est gratuit ?",
    reponse:
      "L'inscription et la recherche de coachs sont entièrement gratuites. Les modalités de paiement des séances se règlent directement entre le coach et le client.",
  },
  {
    question: "Comment contacter un coach ?",
    reponse:
      "Sur le profil public d'un coach, vous trouverez un formulaire de contact. Votre message lui sera transmis par email directement.",
  },
  {
    question: "Puis-je laisser un avis sur un coach ?",
    reponse:
      "Oui, les clients connectés peuvent laisser une note (sur 5) et un commentaire sur la page profil de chaque coach. Ces avis sont visibles publiquement.",
  },
  {
    question: "Comment modifier mon profil coach ?",
    reponse:
      "Connectez-vous et accédez à votre tableau de bord. Vous pouvez y modifier votre photo, votre domaine, votre tarif, votre description, ainsi que votre parcours (diplômes, compétences, expériences) et vos disponibilités.",
  },
];

export default function FaqPage() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Foire aux questions</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="space-y-3">
        {FAQ.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => setOuvert(ouvert === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              {item.question}
              <span className="ml-4 shrink-0 text-gray-400">
                {ouvert === i ? "▲" : "▼"}
              </span>
            </button>
            {ouvert === i && (
              <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
                {item.reponse}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
