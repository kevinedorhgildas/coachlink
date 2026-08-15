# Registre des activités de traitement — CoachLink

*Article 30 du RGPD. Dernière mise à jour : 15 août 2026.*

Ce registre est la pièce qu'une autorité de contrôle demande en premier. Il doit
rester le reflet de ce que l'application fait réellement : en ajoutant un
traitement, ajouter la fiche correspondante dans le même mouvement, et reprendre
`src/app/confidentialite/page.tsx`, qui en est la version publique.

## Responsable du traitement

| | |
|---|---|
| Entité | CoachLink |
| Contact | contact@coachlink.fr |
| Délégué à la protection des données | Non désigné — la désignation n'est pas obligatoire ici (art. 37), le suivi étant assuré par le responsable du traitement. À réexaminer si le suivi de séances devient un suivi systématique à grande échelle. |

## Fiches de traitement

### 1. Gestion des comptes et mise en relation

- **Finalité** — créer et tenir un compte, présenter les coachs, permettre la réservation de séances et en garder l'historique.
- **Personnes concernées** — coachs et clients inscrits.
- **Données** — nom, email, mot de passe (haché par Supabase Auth), rôle, date et version des CGU acceptées ; profil coach (photo, spécialité, ville, tarif, description, diplômes, compétences, expériences, disponibilités) ; profil client (ville) ; réservations, favoris, notifications, historique.
- **Base légale** — exécution du contrat (art. 6.1.b).
- **Destinataires** — Supabase (base et authentification, Irlande), Vercel (hébergement, États-Unis).
- **Durée** — durée de l'inscription ; effacement immédiat à la suppression du compte.
- **Mesures** — RLS Supabase sur l'ensemble des tables, HTTPS, effacement par `supprimer_mon_compte()` et export par `exporter_mes_donnees()`, toutes deux `security definer` et limitées au compte appelant.

### 2. Messagerie et contenus publiés

- **Finalité** — permettre les échanges privés et de groupe, et la publication de contenus par les coachs.
- **Personnes concernées** — coachs et clients inscrits.
- **Données** — contenu des messages privés et de groupe, publications, photos et vidéos, commentaires, « j'aime », documents PDF déposés.
- **Base légale** — exécution du contrat (art. 6.1.b).
- **Destinataires** — Supabase (base et stockage), Vercel.
- **Durée** — durée de l'inscription ; les fichiers des trois buckets (`avatars`, `documents`, `media`) sont supprimés par `actions-rgpd.ts` avant l'effacement du compte, l'API Storage étant la seule voie possible.
- **Point d'attention** — les messages échangés peuvent contenir des informations relatives à la santé ou à la condition physique. Ils ne sont pas traités comme tels par l'application, mais ce risque justifie à lui seul de ne jamais ouvrir ces tables en lecture au-delà de leurs participants.

### 3. Paiements et abonnements

- **Finalité** — vendre des packs de séances et des abonnements, et en assurer le suivi.
- **Personnes concernées** — clients acheteurs, coachs vendeurs.
- **Données** — packs et abonnements souscrits, statut, référence de transaction. **Aucune coordonnée bancaire ne transite par CoachLink** : la saisie a lieu chez Stripe.
- **Base légale** — exécution du contrat (art. 6.1.b) ; obligation légale pour les pièces comptables (art. 6.1.c).
- **Destinataires** — Stripe (paiement), Supabase, Vercel.
- **Durée** — dix ans pour les pièces comptables.

### 4. Notifications et rappels par email

- **Finalité** — prévenir d'une réservation, d'un message, et rappeler une séance la veille.
- **Personnes concernées** — coachs et clients inscrits.
- **Données** — nom, email, date et horaire de la séance, lien de visioconférence le cas échéant.
- **Base légale** — exécution du contrat (art. 6.1.b).
- **Destinataires** — Resend (acheminement).
- **Durée** — pas de conservation propre ; les envois sont déclenchés depuis les données du compte (`src/app/api/cron/route.ts`).

### 5. Newsletter

- **Finalité** — envoyer actualités, conseils et offres aux personnes qui l'ont demandé.
- **Personnes concernées** — toute personne saisissant son adresse, inscrite ou non sur la plateforme.
- **Données** — adresse email, jeton de désabonnement, état actif/inactif.
- **Base légale** — consentement (art. 6.1.a ; art. L. 34-5 CPCE).
- **Destinataires** — Supabase, Resend.
- **Durée** — jusqu'au désabonnement, puis douze mois au plus à titre de preuve du retrait.
- **Mesures** — table fermée en lecture aux non-admins ; inscription et désabonnement par fonctions `security definer` ne sachant faire que leur geste ; réponse identique que l'adresse soit nouvelle ou déjà inscrite, pour ne pas révéler qui figure dans la liste ; lien de retrait à jeton dans chaque envoi ; suppression du compte retirant l'adresse correspondante.
- **Reste à faire** — `newsletter_inscrire` ne rend qu'un statut : l'email de bienvenue ne peut donc pas porter le lien à jeton et renvoie au lien des envois suivants. Faire rendre le jeton par la fonction lors d'une première inscription réglerait le point.

### 6. Prospection de coachs

- **Finalité** — présenter CoachLink à des coachs susceptibles de le rejoindre.
- **Personnes concernées** — coachs non inscrits, dont les coordonnées professionnelles sont relevées sur des sources publiques.
- **Origine des données** — sites professionnels, réseaux sociaux, annuaires. **Les données ne proviennent pas des personnes concernées** : l'article 14 impose de les informer, dans le mois ou dès la première communication.
- **Données** — nom, coordonnée de contact, canal, spécialité, notes de suivi, date d'information (`prospects.informe_le`).
- **Base légale** — intérêt légitime (art. 6.1.f).
- **Durée** — trois ans au plus après le dernier échange, sauf inscription. La vue `prospects_a_purger` liste les lignes échues.
- **Mesures** — mention d'information `MENTION_PROSPECTION` (`src/lib/legal.ts`) jointe au premier contact ; opposition mise en œuvre sans condition.
- **Reste à faire** — la purge des lignes listées par `prospects_a_purger` est manuelle. L'automatiser.

### 7. Service client

- **Finalité** — répondre aux demandes envoyées depuis la page Support.
- **Personnes concernées** — toute personne écrivant depuis le formulaire.
- **Données** — nom, email, sujet, message.
- **Base légale** — intérêt légitime à répondre aux personnes qui nous écrivent (art. 6.1.f).
- **Destinataires** — Resend (acheminement) ; les messages arrivent dans la boîte contact@coachlink.fr et ne sont pas enregistrés en base.
- **Durée** — trois ans après le dernier échange. **Engagement à tenir dans la boîte mail**, aucun mécanisme automatique ne le garantit.

## Sous-traitants

| Sous-traitant | Rôle | Localisation | Transfert hors UE |
|---|---|---|---|
| Supabase | Base de données, authentification, stockage | Irlande | Non |
| Vercel | Hébergement de l'application | États-Unis | Oui — clauses contractuelles types |
| Stripe | Paiements et abonnements | États-Unis / Irlande | Oui — clauses contractuelles types |
| Resend | Acheminement des emails | États-Unis | Oui — clauses contractuelles types |

**À faire hors dépôt** — accepter et archiver le contrat de sous-traitance (DPA) de
chacun des quatre prestataires depuis sa console. Aucun n'est aujourd'hui conservé,
et l'article 28.3 en fait une obligation écrite.

## Droits des personnes

| Droit | Comment il s'exerce |
|---|---|
| Accès et portabilité | « Télécharger mes données » depuis Mon compte — export JSON complet (`/api/mes-donnees`). |
| Rectification | Directement depuis les pages de profil, ou par email. |
| Effacement | « Supprimer mon compte » depuis Mon compte — fichiers puis compte, en cascade sur les 23 tables. |
| Opposition, limitation | contact@coachlink.fr. |
| Retrait du consentement (newsletter) | Lien de désabonnement dans chaque envoi, ou email. |
| Réclamation | CNIL — www.cnil.fr. |

Délai de réponse : un mois (art. 12.3).

## Violation de données

En cas de violation, l'article 33 laisse **72 heures** pour notifier la CNIL, et
l'article 34 impose d'informer les personnes concernées lorsque le risque est
élevé. À ce jour, aucune procédure écrite ni journal des violations n'existe :
c'est le prochain manque à combler.

## Points ouverts

- Aucun DPA archivé pour les quatre sous-traitants (art. 28.3).
- Aucune procédure ni journal de violation de données (art. 33.5).
- Purge des prospects échus non automatisée.
- Un utilisateur connecté peut lire l'email des coachs : le rôle `authenticated` conserve le privilège sur toute la table `profiles`, faute d'une vue restreinte. Détaillé dans `supabase/rgpd_correctifs.sql`.
- Durées de conservation du service client et des prospects tenues à la main.
