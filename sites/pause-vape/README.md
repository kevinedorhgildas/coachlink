# La Pause Vape & Détente — site vitrine

Site vitrine statique (une page) pour la boutique **La Pause Vape & Détente**,
12 Av. Aristide Briand, 67100 Strasbourg.

Aucun framework, aucune dépendance à installer : trois fichiers, ouverture directe
dans le navigateur.

```
sites/pause-vape/
├── index.html            # toutes les sections
└── assets/
    ├── styles.css        # design system + adaptatif + animations
    ├── script.js         # interactions (config en haut du fichier)
    └── favicon.svg
```

## Aperçu local

```bash
cd sites/pause-vape
python3 -m http.server 4173
# http://localhost:4173
```

## Contenu

| Section | Contenu |
| --- | --- |
| Héros | note Google 5/5, promesse, appel + itinéraire, statut d'ouverture en direct |
| Services | 6 prestations (sevrage, e-liquides, matériel, accessoires, thés & infusions, SAV) |
| À propos | texte de la boutique, engagements, chiffres clés |
| Avis | note globale + 3 avis Google |
| Contact | téléphone, itinéraire, horaires (jour du jour surligné), formulaire |

## Configuration

Tout se règle en haut de `assets/script.js` :

```js
var CONFIG = {
  email: 'contact@lapausevape.fr', // ← adresse réelle de la boutique à renseigner
  phone: '+33361431379',
  formEndpoint: null               // ← URL d'un service de formulaire (optionnel)
};
```

- `formEndpoint` **vide** : le formulaire ouvre la messagerie du visiteur avec un
  message pré-rempli vers `CONFIG.email`.
- `formEndpoint` **renseignée** (Formspree, Resend, route API…) : le formulaire
  envoie un `POST` JSON `{ name, contact, topic, message }` et affiche une
  confirmation sans quitter la page.

Les horaires sont définis à deux endroits, à garder synchronisés :
la liste `HOURS` dans `script.js` (calcul du statut ouvert/fermé) et le tableau
`#hours-list` dans `index.html` (affichage).

À remplacer avant mise en ligne : le domaine `https://lapausevape.fr/` dans les
balises `canonical`, `og:*` et le JSON-LD.

## Choix techniques

- **Performance** : pas de JS tiers, CSS et JS < 30 Ko au total, polices chargées
  sans bloquer le rendu (`media="print"` + `onload`), aucune image à télécharger
  (les visuels sont des dégradés et des SVG en ligne).
- **Mobile** : mise en page fluide via `clamp()`, menu plein écran, barre d'appel
  fixe en bas d'écran qui s'efface une fois la section Contact atteinte.
- **Animations** : révélations au défilement en `IntersectionObserver` avec
  décalage, en-tête qui se compacte, effets de survol. `prefers-reduced-motion`
  désactive l'ensemble ; sans JavaScript, tout le contenu reste visible.
- **Référencement local** : JSON-LD `Store` (adresse, téléphone, horaires, note),
  métadonnées Open Graph, hiérarchie de titres unique.
- **Accessibilité** : lien d'évitement, focus visibles, libellés de formulaire,
  `aria-live` sur les retours, contrastes conformes AA.

## Cadre légal

Le site présente l'activité de la boutique, sans vente en ligne. Sont intégrés :
un contrôle d'âge 18+ mémorisé localement, la mention « Vente interdite aux
mineurs de moins de 18 ans. La nicotine crée une forte dépendance. » et le renvoi
vers Tabac info service (39 89).

La publicité en faveur des produits du vapotage est encadrée en France
(art. L3513-4 du code de la santé publique). Les textes ont été rédigés dans une
tonalité informative — présentation de l'établissement et de ses services — sans
incitation à la consommation. Une relecture par la boutique avant mise en ligne
reste recommandée.
