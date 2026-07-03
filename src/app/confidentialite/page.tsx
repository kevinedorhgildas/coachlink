import Link from "next/link";

const GOLD = "#C9A96E";

const ARTICLES = [
  {
    titre: "Responsable du traitement",
    contenu: "CoachLink est responsable du traitement de vos données personnelles. Pour toute question, contactez-nous à contact@coachlink.fr.",
  },
  {
    titre: "Données collectées",
    contenu: "Nous collectons les données suivantes lors de votre utilisation de CoachLink :",
    liste: [
      "Données d'inscription : nom, adresse email, mot de passe (chiffré), rôle (coach ou client).",
      "Données de profil coach : photo, spécialité, ville, tarif, description, diplômes, compétences, expériences, disponibilités.",
      "Données de profil client : ville.",
      "Données de réservation : date, créneau, message, statut.",
      "Avis : note et commentaire laissés sur un coach.",
      "Documents : fichiers PDF partagés par les coachs.",
    ],
  },
  {
    titre: "Finalités du traitement",
    contenu: "Vos données sont utilisées pour :",
    liste: [
      "la création et la gestion de votre compte ;",
      "la mise en relation entre coachs et clients ;",
      "la gestion des réservations et de l'historique des séances ;",
      "l'envoi de notifications par email liées à votre activité ;",
      "l'amélioration de nos services.",
    ],
  },
  {
    titre: "Base légale",
    contenu: "Le traitement de vos données repose sur l'exécution du contrat (CGU) que vous acceptez lors de votre inscription, ainsi que sur notre intérêt légitime à améliorer la plateforme.",
  },
  {
    titre: "Partage des données",
    contenu: "Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec :",
    liste: [
      "Supabase : hébergement de la base de données et authentification ;",
      "Vercel : hébergement de l'application ;",
      "Resend : envoi d'emails transactionnels.",
    ],
    suite: "Ces prestataires agissent en qualité de sous-traitants et sont soumis à des obligations strictes de confidentialité.",
  },
  {
    titre: "Durée de conservation",
    contenu: "Vos données sont conservées pendant toute la durée de votre inscription. En cas de suppression de votre compte, vos données sont effacées dans un délai de 30 jours, à l'exception des données requises par la loi.",
  },
  {
    titre: "Vos droits (RGPD)",
    contenu: "Conformément au RGPD, vous disposez des droits suivants :",
    liste: [
      "Droit d'accès : obtenir une copie de vos données.",
      "Droit de rectification : corriger vos données inexactes.",
      "Droit à l'effacement : demander la suppression de votre compte et de vos données.",
      "Droit d'opposition : vous opposer à certains traitements.",
      "Droit à la portabilité : recevoir vos données dans un format structuré.",
    ],
    suite: "Pour exercer ces droits, contactez-nous à contact@coachlink.fr. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).",
  },
  {
    titre: "Sécurité",
    contenu: "Nous mettons en œuvre des mesures techniques appropriées pour protéger vos données : chiffrement des mots de passe, HTTPS, accès restreints par politiques RLS Supabase.",
  },
  {
    titre: "Cookies",
    contenu: "CoachLink utilise uniquement des cookies strictement nécessaires au fonctionnement de la session utilisateur (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.",
  },
];

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-gray-400 hover:text-gray-700 transition">← Accueil</Link>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Légal</p>
        <h1 className="text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-gray-400">Dernière mise à jour : 3 juillet 2026</p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="space-y-4">
          {ARTICLES.map((article, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${GOLD}22`, color: GOLD }}>
                  {i + 1}
                </span>
                {article.titre}
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">{article.contenu}</p>
              {article.liste && (
                <ul className="mt-3 space-y-1.5">
                  {article.liste.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {article.suite && <p className="mt-3 text-sm leading-relaxed text-gray-600">{article.suite}</p>}
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-6 text-sm">
          <Link href="/cgu" className="font-medium hover:underline" style={{ color: GOLD }}>CGU</Link>
          <Link href="/support" className="font-medium hover:underline" style={{ color: GOLD }}>Service client</Link>
        </div>
      </div>
    </main>
  );
}
