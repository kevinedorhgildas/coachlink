import Link from "next/link";

const GOLD = "#C9A96E";

/**
 * Les valeurs que seule la société connaît.
 *
 * Elles sont rassemblées ici plutôt que dispersées dans le texte pour qu'il
 * n'y ait qu'un seul endroit à corriger, et qu'aucune ne puisse être oubliée :
 * la page signale d'elle-même celles qui restent à compléter (voir
 * `AVERTISSEMENT` plus bas). Ce sont des mentions obligatoires — les laisser
 * fausses serait pire que les laisser vides.
 */
const SOCIETE = {
  denomination: "À COMPLÉTER — dénomination sociale exacte au Kbis",
  forme: "Société par actions simplifiée unipersonnelle (SASU)",
  capital: "À COMPLÉTER — montant du capital social, en euros",
  siege: "À COMPLÉTER — adresse complète du siège social",
  rcs: "À COMPLÉTER — numéro RCS et ville du greffe",
  siret: "À COMPLÉTER — numéro SIRET",
  tva: "À COMPLÉTER — numéro de TVA intracommunautaire",
  president: "À COMPLÉTER — nom et prénom du président",
  email: "contact@coachlink.fr",
  telephone: "À COMPLÉTER — numéro de téléphone",
};

/**
 * L'hébergeur : mention imposée par la LCEN, art. 6-III, qui exige son nom,
 * son adresse et un moyen de le joindre.
 *
 * À vérifier avant publication : cette adresse est celle couramment citée par
 * Vercel, mais elle n'a pas été confirmée à la source. Sur une page qui engage
 * juridiquement, elle mérite d'être recoupée avec les mentions officielles de
 * vercel.com.
 */
const HEBERGEUR = {
  nom: "Vercel Inc.",
  adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  contact: "https://vercel.com",
};

const BASE_DONNEES = {
  nom: "Supabase Inc.",
  precision: "Base de données et authentification, hébergées dans l'Union européenne (région eu-west-1, Irlande).",
};

const SECTIONS = [
  {
    titre: "Éditeur du site",
    lignes: [
      ["Dénomination sociale", SOCIETE.denomination],
      ["Forme juridique", SOCIETE.forme],
      ["Capital social", SOCIETE.capital],
      ["Siège social", SOCIETE.siege],
      ["Immatriculation", SOCIETE.rcs],
      ["SIRET", SOCIETE.siret],
      ["TVA intracommunautaire", SOCIETE.tva],
      ["Contact", SOCIETE.email],
      ["Téléphone", SOCIETE.telephone],
    ],
  },
  {
    titre: "Directeur de la publication",
    lignes: [["Directeur de la publication", SOCIETE.president]],
  },
  {
    titre: "Hébergement",
    lignes: [
      ["Hébergeur du site", `${HEBERGEUR.nom} — ${HEBERGEUR.adresse}`],
      ["Site de l'hébergeur", HEBERGEUR.contact],
      ["Base de données", `${BASE_DONNEES.nom} — ${BASE_DONNEES.precision}`],
    ],
  },
];

const TEXTES = [
  {
    titre: "Propriété intellectuelle",
    contenu:
      "L'ensemble des éléments composant CoachLink — structure, textes, identité visuelle, logos et code source — est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable, est interdite.\n\nLes contenus publiés par les utilisateurs (profils, photos, documents, avis, publications) restent la propriété de leurs auteurs, qui concèdent à CoachLink une licence d'affichage limitée aux besoins du service.",
  },
  {
    titre: "Données personnelles",
    contenu:
      "Le traitement des données personnelles est décrit dans la politique de confidentialité, qui précise les données collectées, leurs finalités, leurs durées de conservation et la manière d'exercer vos droits. Vous pouvez à tout moment introduire une réclamation auprès de la CNIL (www.cnil.fr).",
  },
  {
    titre: "Médiation de la consommation",
    contenu:
      "Conformément à l'article L.612-1 du code de la consommation, tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige l'opposant à un professionnel.\n\nÀ COMPLÉTER — nom, adresse et site du médiateur auprès duquel la société a adhéré. L'adhésion à un dispositif de médiation est obligatoire pour tout professionnel vendant à des consommateurs.",
  },
  {
    titre: "Règlement en ligne des litiges",
    contenu:
      "La Commission européenne met à disposition une plateforme de règlement en ligne des litiges, accessible à l'adresse https://ec.europa.eu/consumers/odr.",
  },
];

/**
 * Le bandeau n'apparaît que tant qu'il reste des champs à compléter : une fois
 * `SOCIETE` renseigné, il disparaît de lui-même. C'est ce qui évite qu'une page
 * incomplète passe inaperçue en production.
 */
const AVERTISSEMENT = [
  ...Object.values(SOCIETE),
  ...TEXTES.map((t) => t.contenu),
].some((v) => v.includes("À COMPLÉTER"));

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen" style={{ background: "#FAF8F5" }}>
      <div className="border-b border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-gray-400 transition hover:text-gray-700">
          ← Accueil
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
          Légal
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Mentions légales</h1>
        <p className="mt-2 text-sm text-gray-400">Dernière mise à jour : 15 août 2026</p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {AVERTISSEMENT && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">Page incomplète</p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
              Certaines mentions obligatoires ne sont pas encore renseignées. Elles figurent
              ci-dessous sous la forme « À COMPLÉTER » et se trouvent toutes en haut du fichier{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
                src/app/mentions-legales/page.tsx
              </code>
              . Ce bandeau disparaîtra une fois les champs remplis.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.titre} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-bold text-gray-900">{section.titre}</h2>
              <dl className="space-y-3">
                {section.lignes.map(([label, valeur]) => (
                  <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                    <dt className="shrink-0 text-sm font-medium text-gray-500 sm:w-52">{label}</dt>
                    <dd
                      className={`text-sm ${
                        valeur.includes("À COMPLÉTER") ? "font-medium text-amber-700" : "text-gray-800"
                      }`}
                    >
                      {valeur}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          {TEXTES.map((texte) => (
            <div key={texte.titre} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-bold text-gray-900">{texte.titre}</h2>
              {texte.contenu.split("\n\n").map((paragraphe, i) => (
                <p
                  key={i}
                  className={`text-sm leading-relaxed ${
                    paragraphe.includes("À COMPLÉTER") ? "mt-3 font-medium text-amber-700" : "mt-3 text-gray-600 first:mt-0"
                  }`}
                >
                  {paragraphe}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/cgu" className="font-medium hover:underline" style={{ color: GOLD }}>
            CGU
          </Link>
          <Link href="/confidentialite" className="font-medium hover:underline" style={{ color: GOLD }}>
            Confidentialité
          </Link>
          <Link href="/support" className="font-medium hover:underline" style={{ color: GOLD }}>
            Service client
          </Link>
        </div>
      </div>
    </main>
  );
}
