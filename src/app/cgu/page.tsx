import Link from "next/link";

const GOLD = "#C9A96E";

const ARTICLES = [
  {
    titre: "1. Présentation de la plateforme",
    contenu: "CoachLink est une plateforme de mise en relation entre des coachs professionnels et des particuliers ou professionnels souhaitant bénéficier de leurs services, dans tous domaines de coaching (sportif, business, développement personnel, bien-être, finance, langues, etc.).\n\nL'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des présentes CGU. Toute personne qui accède à CoachLink s'engage à les respecter.",
  },
  {
    titre: "2. Inscription et accès au compte",
    contenu: "Pour utiliser les fonctionnalités de CoachLink, l'utilisateur doit créer un compte en renseignant des informations exactes, complètes et à jour. Deux types de comptes sont proposés :",
    liste: [
      "Compte Coach : permet de créer un profil public, de renseigner ses disponibilités, son parcours, ses tarifs, et de gérer les réservations reçues.",
      "Compte Client : permet de rechercher des coachs, de consulter leurs profils, de réserver des créneaux et de laisser des avis.",
    ],
    suite: "L'utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte.",
  },
  {
    titre: "3. Rôle de CoachLink",
    contenu: "CoachLink agit en qualité d'intermédiaire technique entre coachs et clients. La plateforme ne fait pas partie du contrat de prestation conclu entre le coach et le client et n'est pas responsable :",
    liste: [
      "de la qualité des prestations fournies par les coachs ;",
      "des informations renseignées par les utilisateurs (diplômes, compétences, expériences) ;",
      "des modalités de paiement convenues entre les parties ;",
      "des litiges pouvant survenir entre un coach et un client.",
    ],
  },
  {
    titre: "4. Obligations des coachs",
    contenu: "Le coach s'engage à :",
    liste: [
      "fournir des informations véridiques sur son profil, ses diplômes et ses expériences ;",
      "répondre aux demandes de réservation dans un délai raisonnable ;",
      "respecter les créneaux confirmés ;",
      "ne pas proposer de contenu illicite, trompeur ou contraire aux bonnes mœurs.",
    ],
  },
  {
    titre: "5. Obligations des clients",
    contenu: "Le client s'engage à :",
    liste: [
      "utiliser la plateforme de bonne foi ;",
      "honorer les réservations confirmées ;",
      "rédiger des avis honnêtes et non diffamatoires ;",
      "ne pas tenter de contourner la plateforme pour éviter les engagements pris.",
    ],
  },
  {
    titre: "6. Avis et notations",
    contenu: "Les avis laissés sur la plateforme doivent refléter une expérience réelle avec le coach concerné. CoachLink se réserve le droit de supprimer tout avis jugé abusif, frauduleux ou contraire aux présentes CGU, sans préavis.",
  },
  {
    titre: "7. Propriété intellectuelle",
    contenu: "Les documents PDF, programmes et ressources publiés par les coachs restent leur propriété exclusive. Les clients ne sont pas autorisés à redistribuer, copier ou commercialiser ces contenus sans l'accord exprès du coach concerné.",
  },
  {
    titre: "8. Suspension et résiliation",
    contenu: "CoachLink se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU, de comportement abusif, de fraude ou d'utilisation contraire à l'objet de la plateforme, sans obligation de remboursement ni indemnité.",
  },
  {
    titre: "9. Modification des CGU",
    contenu: "CoachLink se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification significative. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.",
  },
  {
    titre: "10. Droit applicable",
    contenu: "Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, les tribunaux français seront seuls compétents.",
  },
  {
    titre: "11. Contact",
    contenu: "Pour toute question relative aux présentes CGU, vous pouvez contacter l'équipe CoachLink à l'adresse : contact@coachlink.fr.",
  },
];

export default function CGUPage() {
  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-gray-400 hover:text-gray-700 transition">← Accueil</Link>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Légal</p>
        <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
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
                {article.titre.replace(/^\d+\.\s/, "")}
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{article.contenu}</p>
              {article.liste && (
                <ul className="mt-3 space-y-1.5">
                  {article.liste.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {article.suite && <p className="mt-3 text-sm leading-relaxed text-gray-600">{article.suite}</p>}
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-6 text-sm text-gray-400">
          <Link href="/confidentialite" className="hover:underline" style={{ color: GOLD }}>Politique de confidentialité</Link>
          <Link href="/support" className="hover:underline" style={{ color: GOLD }}>Service client</Link>
        </div>
      </div>
    </main>
  );
}
