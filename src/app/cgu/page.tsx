import Link from "next/link";

export default function CGUPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Accueil</Link>
      </div>

      <p className="mb-8 text-sm text-gray-400">Dernière mise à jour : 3 juillet 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">1. Présentation de la plateforme</h2>
          <p>CoachLink est une plateforme de mise en relation entre des coachs professionnels et des particuliers ou professionnels souhaitant bénéficier de leurs services, dans tous domaines de coaching (sportif, business, développement personnel, bien-être, finance, langues, etc.).</p>
          <p className="mt-2">L'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des présentes CGU. Toute personne qui accède à CoachLink s'engage à les respecter.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">2. Inscription et accès au compte</h2>
          <p>Pour utiliser les fonctionnalités de CoachLink, l'utilisateur doit créer un compte en renseignant des informations exactes, complètes et à jour. Deux types de comptes sont proposés :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Compte Coach</strong> : permet de créer un profil public, de renseigner ses disponibilités, son parcours, ses tarifs, et de gérer les réservations reçues.</li>
            <li><strong>Compte Client</strong> : permet de rechercher des coachs, de consulter leurs profils, de réserver des créneaux et de laisser des avis.</li>
          </ul>
          <p className="mt-2">L'utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">3. Rôle de CoachLink</h2>
          <p>CoachLink agit en qualité d'intermédiaire technique entre coachs et clients. La plateforme ne fait pas partie du contrat de prestation conclu entre le coach et le client et n'est pas responsable :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>de la qualité des prestations fournies par les coachs ;</li>
            <li>des informations renseignées par les utilisateurs (diplômes, compétences, expériences) ;</li>
            <li>des modalités de paiement convenues entre les parties ;</li>
            <li>des litiges pouvant survenir entre un coach et un client.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibond text-gray-900">4. Obligations des coachs</h2>
          <p>Le coach s'engage à :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>fournir des informations véridiques sur son profil, ses diplômes et ses expériences ;</li>
            <li>répondre aux demandes de réservation dans un délai raisonnable ;</li>
            <li>respecter les créneaux confirmés ;</li>
            <li>ne pas proposer de contenu illicite, trompeur ou contraire aux bonnes mœurs dans les documents partagés.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">5. Obligations des clients</h2>
          <p>Le client s'engage à :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>utiliser la plateforme de bonne foi ;</li>
            <li>honorer les réservations confirmées ;</li>
            <li>rédiger des avis honnêtes et non diffamatoires ;</li>
            <li>ne pas tenter de contourner la plateforme pour éviter les engagements pris.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">6. Avis et notations</h2>
          <p>Les avis laissés sur la plateforme doivent refléter une expérience réelle avec le coach concerné. CoachLink se réserve le droit de supprimer tout avis jugé abusif, frauduleux ou contraire aux présentes CGU, sans préavis.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">7. Propriété intellectuelle</h2>
          <p>Les documents PDF, programmes et ressources publiés par les coachs restent leur propriété exclusive. Les clients ne sont pas autorisés à redistribuer, copier ou commercialiser ces contenus sans l'accord exprès du coach concerné.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">8. Suspension et résiliation</h2>
          <p>CoachLink se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU, de comportement abusif, de fraude ou d'utilisation contraire à l'objet de la plateforme, sans obligation de remboursement ni indemnité.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">9. Modification des CGU</h2>
          <p>CoachLink se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification significative. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">10. Droit applicable</h2>
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, les tribunaux français seront seuls compétents.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">11. Contact</h2>
          <p>Pour toute question relative aux présentes CGU, vous pouvez contacter l'équipe CoachLink à l'adresse : <a href="mailto:contact@coachlink.fr" className="text-blue-600 hover:underline">contact@coachlink.fr</a>.</p>
        </section>
      </div>

      <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
        <Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
        {" · "}
        <Link href="/support" className="hover:underline">Service client</Link>
      </div>
    </main>
  );
}
