"use client";

import { useState } from "react";
import Link from "next/link";

const GOLD = "#C9A96E";

const FAQ = [
  { question: "Qu'est-ce que CoachLink ?", reponse: "CoachLink est une plateforme qui met en relation des coachs professionnels et des clients dans tous les domaines : sport, finance, développement personnel, business, bien-être, langues, et bien plus encore." },
  { question: "Comment trouver un coach ?", reponse: "Créez un compte client, puis accédez à votre tableau de bord. Vous pouvez rechercher un coach par domaine, ville ou tarif. Cliquez sur un profil pour voir ses disponibilités, son parcours et laisser une réservation." },
  { question: "Comment devenir coach sur CoachLink ?", reponse: "Inscrivez-vous en choisissant le rôle « Coach ». Complétez ensuite votre profil : photo, domaine, tarif, description, diplômes, compétences, expériences et disponibilités. Votre profil sera visible publiquement par tous les clients." },
  { question: "Comment fonctionne la réservation ?", reponse: "Le client choisit un créneau disponible sur le profil du coach et envoie une demande de réservation. Le coach reçoit la demande sur son tableau de bord et peut l'accepter ou la refuser. Le client est informé du statut depuis son tableau de bord." },
  { question: "Est-ce que CoachLink est gratuit ?", reponse: "L'inscription et la recherche de coachs sont entièrement gratuites. Les modalités de paiement des séances se règlent directement entre le coach et le client." },
  { question: "Comment contacter un coach ?", reponse: "Sur le profil public d'un coach, vous trouverez un formulaire de contact. Votre message lui sera transmis par email directement." },
  { question: "Puis-je laisser un avis sur un coach ?", reponse: "Oui, les clients connectés peuvent laisser une note (sur 5) et un commentaire sur la page profil de chaque coach. Ces avis sont visibles publiquement." },
  { question: "Comment modifier mon profil coach ?", reponse: "Connectez-vous et accédez à votre tableau de bord. Vous pouvez y modifier votre photo, votre domaine, votre tarif, votre description, ainsi que votre parcours (diplômes, compétences, expériences) et vos disponibilités." },
];

export default function FaqPage() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-gray-400 hover:text-gray-700 transition">← Accueil</Link>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Aide</p>
        <h1 className="text-3xl font-bold text-gray-900">Foire aux questions</h1>
        <p className="mt-2 text-gray-500">Trouvez rapidement une réponse à vos questions.</p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <button
                onClick={() => setOuvert(ouvert === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-900"
              >
                <span>{item.question}</span>
                <span className="ml-4 shrink-0 text-lg transition-transform" style={{ color: GOLD, transform: ouvert === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▾
                </span>
              </button>
              {ouvert === i && (
                <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-gray-600">
                  {item.reponse}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #0B1120, #111827)" }}>
          <p className="text-sm font-medium text-white/70">Vous n'avez pas trouvé votre réponse ?</p>
          <Link
            href="/support"
            className="mt-3 inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
          >
            Contacter le service client →
          </Link>
        </div>
      </div>
    </main>
  );
}
