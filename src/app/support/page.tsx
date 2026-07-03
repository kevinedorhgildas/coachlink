"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { contactSupport } from "./actions";

const GOLD = "#C9A96E";
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-amber-400 focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

const SUJETS = [
  "Problème de connexion / inscription",
  "Problème avec une réservation",
  "Signaler un coach",
  "Signaler un client",
  "Problème technique",
  "Question sur la plateforme",
  "Autre",
];

export default function SupportPage() {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await contactSupport(formData);
    },
    undefined
  );

  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-gray-400 hover:text-gray-700 transition">← Accueil</Link>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Aide</p>
        <h1 className="text-3xl font-bold text-gray-900">Service client</h1>
        <p className="mt-2 text-gray-500">Notre équipe vous répond sous 24 à 48h ouvrées.</p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">

        {/* Contact direct */}
        <div className="flex items-center gap-4 rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #0B1120, #111827)", border: `1px solid ${GOLD}22` }}>
          <div className="text-2xl shrink-0">✉️</div>
          <div>
            <p className="text-sm font-semibold text-white">Contactez-nous directement</p>
            <p className="mt-0.5 text-sm" style={{ color: "#ffffff60" }}>
              Écrivez-nous à{" "}
              <a href="mailto:contact@coachlink.fr" className="font-medium hover:underline" style={{ color: GOLD }}>
                contact@coachlink.fr
              </a>
            </p>
          </div>
        </div>

        {/* Formulaire */}
        {state?.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center shadow-sm">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-lg font-bold text-emerald-800">Message envoyé !</p>
            <p className="mt-2 text-sm text-emerald-700">Nous vous répondrons sous 24 à 48h ouvrées.</p>
            <Link href="/" className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <form action={formAction} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">Envoyer un message</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom</label>
                <input name="nom" type="text" required placeholder="Votre nom" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" required placeholder="vous@exemple.com" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Sujet</label>
              <select name="sujet" required className={inputClass}>
                <option value="">— Choisissez un sujet —</option>
                {SUJETS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Message</label>
              <textarea name="message" rows={5} required placeholder="Décrivez votre problème ou question..." className={inputClass} style={{ resize: "none" }} />
            </div>

            {state?.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
            )}

            <button
              type="submit"
              className="rounded-xl px-6 py-3 text-sm font-semibold shadow-md transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
            >
              Envoyer le message
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400">
          Consultez d'abord notre{" "}
          <Link href="/faq" className="font-semibold hover:underline" style={{ color: GOLD }}>FAQ</Link>
          {" "}— votre réponse s'y trouve peut-être.
        </p>
      </div>
    </main>
  );
}
