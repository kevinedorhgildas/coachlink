import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Politique de confidentialité</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Accueil</Link>
      </div>

      <p className="mb-8 text-sm text-gray-400">Dernière mise à jour : 3 juillet 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">1. Responsable du traitement</h2>
          <p>CoachLink est responsable du traitement de vos données personnelles. Pour toute question, contactez-nous à <a href="mailto:contact@coachlink.fr" className="text-blue-600 hover:underline">contact@coachlink.fr</a>.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">2. Données collectées</h2>
          <p>Nous collectons les données suivantes lors de votre utilisation de CoachLink :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Données d'inscription</strong> : nom, adresse email, mot de passe (chiffré), rôle (coach ou client).</li>
            <li><strong>Données de profil coach</strong> : photo, spécialité, ville, tarif, description, diplômes, compétences, expériences professionnelles, disponibilités.</li>
            <li><strong>Données de profil client</strong> : ville.</li>
            <li><strong>Données de réservation</strong> : date, créneau, message, statut.</li>
            <li><strong>Avis</strong> : note et commentaire laissés sur un coach.</li>
            <li><strong>Documents</strong> : fichiers PDF partagés par les coachs.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">3. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>la création et la gestion de votre compte ;</li>
            <li>la mise en relation entre coachs et clients ;</li>
            <li>la gestion des réservations et de l'historique des séances ;</li>
            <li>l'envoi de notifications par email liées à votre activité sur la plateforme ;</li>
            <li>l'amélioration de nos services.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">4. Base légale</h2>
          <p>Le traitement de vos données repose sur l'exécution du contrat (CGU) que vous acceptez lors de votre inscription, ainsi que sur notre intérêt légitime à améliorer la plateforme.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">5. Partage des données</h2>
          <p>Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Supabase</strong> : hébergement de la base de données et authentification ;</li>
            <li><strong>Vercel</strong> : hébergement de l'application ;</li>
            <li><strong>Resend</strong> : envoi d'emails transactionnels.</li>
          </ul>
          <p className="mt-2">Ces prestataires agissent en qualité de sous-traitants et sont soumis à des obligations strictes de confidentialité.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">6. Durée de conservation</h2>
          <p>Vos données sont conservées pendant toute la durée de votre inscription sur CoachLink. En cas de suppression de votre compte, vos données sont effacées dans un délai de 30 jours, à l'exception des données requises par la loi.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">7. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données.</li>
            <li><strong>Droit de rectification</strong> : corriger vos données inexactes.</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte et de vos données.</li>
            <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements.</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
          </ul>
          <p className="mt-2">Pour exercer ces droits, contactez-nous à <a href="mailto:contact@coachlink.fr" className="text-blue-600 hover:underline">contact@coachlink.fr</a>. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnil.fr</a>).</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">8. Sécurité</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation (chiffrement des mots de passe, HTTPS, accès restreints par politiques RLS Supabase).</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">9. Cookies</h2>
          <p>CoachLink utilise uniquement des cookies strictement nécessaires au fonctionnement de la session utilisateur (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
        </section>

      </div>

      <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
        <Link href="/cgu" className="hover:underline">Conditions Générales d'Utilisation</Link>
        {" · "}
        <Link href="/support" className="hover:underline">Service client</Link>
      </div>
    </main>
  );
}
