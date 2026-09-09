# SubVerif — Portail Dématérialisé de Candidature aux Subventions & Pipeline OCR

**SubVerif** est un prototype d'application web permettant aux candidats (associations, entreprises, indépendants, structures publiques) de soumettre un dossier de demande de subvention avec **extraction optique de caractères (OCR) et classification automatique des pièces justificatives côté client**.

L'application couvre exclusivement la phase **réception, classification et extraction documentaire**. Le contrôle d'éligibilité approfondi et la synthèse d'aide à la décision sont traités en aval par un service d'orchestration externe alimenté par le webhook. Aucune décision d'octroi ou de refus n'est émise par cette interface.

---

## 🌟 Fonctionnalités Clés

1. **Formulaire Multi-Étapes Robuste (Wizard en 5 étapes)** :
   - **Étape 1 — Profil demandeur** : Statut juridique, raison sociale, contrôle SIRET 14 chiffres, secteur d'activité, adresse géographique, ancienneté.
   - **Étape 2 — Projet** : Objet de l'opération, description détaillée, calendrier prévisionnel (début/fin avec contrôle de cohérence temporelle), choix du programme visé.
   - **Étape 3 — Budget** : Montant total, subvention demandée, tableau dynamique des postes de dépenses et plan de financement (cofinanceurs, statuts sollicité/acquis).
   - **Étape 4 — Pièces justificatives & OCR** : Dépôt par glisser-déposer (PDF, JPG, PNG), conversion en mémoire Base64, reconnaissance optique automatique avec barre de progression en temps réel, suggestion d'étiquette, extraction de champs indicatifs par regex (IBAN, SIRET, montant, dates) et prévisualisation/édition manuelle du texte extrait.
   - **Étape 5 — Récapitulatif, Certification & Envoi** : Synthèse complète du dossier, déclaration sur l'honneur obligatoire, transmission sécurisée en POST JSON vers le Webhook, et écran de confirmation avec identifiant unique (UUID v4) et reçu imprimable/téléchargeable en PDF.

2. **Pipeline OCR Multi-Niveaux 100% Côté Client** :
   - **Fichiers images (PNG, JPG, JPEG)** : Traitement direct par le worker `tesseract.js` avec le dictionnaire de langue française (`fra.traineddata`).
   - **Fichiers PDF natifs (texte vectoriel)** : Extraction ultra-rapide via l'API `getTextContent()` de `pdf.js`.
   - **Fichiers PDF scannés / non sélectionnables (fallback automatique)** : Si le texte extrait est inférieur à 20 caractères, le moteur bascule automatiquement sur le rendu graphique de chaque page dans un `<canvas>` haute résolution (scale 1.5x), puis soumet les images résultantes à Tesseract.js.
   - **Nettoyage et Normalisation** : Suppression des espaces parasites et retours chariots multiples.
   - **Détection lexicale de type de document** : Analyse de mots-clés pour pré-sélectionner automatiquement le type de pièce (*RIB, Devis, Attestation, Statuts, Pièce d'identité, Formulaire, Autre*).
   - **Suggestions Regex** : Extraction indicative de l'IBAN, du SIRET, des montants en euros et des dates, sans écrasement automatique.

3. **Architecture Zero-Backend & Encodage Mémoire** :
   - Aucun serveur backend applicatif requis pour faire tourner l'app : le build est statique et peut être déployé sur n'importe quel hébergement statique (Vercel, Netlify, GitHub Pages, S3, Cloudflare Pages).
   - Traitement en mémoire vive : les fichiers sont convertis en chaînes Base64 (`data:mime;base64,...`) uniquement pour être expédiés dans le payload. Aucune donnée n'est persistée sur le disque local ou le serveur frontend.

---

## 🛠️ Stack Technique

- **Frontend & Bundler** : [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling** : [Tailwind CSS v3](https://tailwindcss.com/) + Icônes [Lucide React](https://lucide.dev/)
- **Gestion de formulaires & Validation** : [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Moteur PDF & OCR** :
  - [`pdfjs-dist`](https://github.com/mozilla/pdf.js) (v4.10.x) pour le parsing de documents PDF et le rendu Canvas
  - [`tesseract.js`](https://github.com/naptha/tesseract.js) (v7.x) pour la reconnaissance optique de caractères en français
- **Identifiants** : `uuid` (UUID v4)

---

## 🚀 Installation et Lancement

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- `npm` ou `pnpm` / `yarn`

### 2. Cloner et installer les dépendances
```bash
cd SubVerif
npm install
```

### 3. Configuration des variables d'environnement
Copiez le fichier d'exemple `.env.example` en `.env` :
```bash
cp .env.example .env
```

Vérifiez ou adaptez la variable `VITE_WEBHOOK_URL` :
```env
VITE_WEBHOOK_URL=https://stg-orch-api.abafusion.ai/webhook/webhook-v93p8wtjgrud6dksfbtxdn5m/condidat
```

> **Astuce de test alternatif** : Si vous souhaitez inspecter les requêtes HTTP POST en temps réel dans votre navigateur, vous pouvez générer une URL temporaire sur [webhook.site](https://webhook.site) et la coller dans votre fichier `.env`.

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application s'ouvre sur `http://localhost:5173`.

### 5. Compiler pour la production
```bash
npm run build
```

---

## 📦 Structure de la Charge Utile (Payload Webhook)

Lors de la validation de l'étape 5, l'application effectue une requête HTTP `POST` avec l'en-tête `Content-Type: application/json` contenant la structure suivante :

```json
{
  "dossier_id": "8f3b26c7-7e61-4fa3-95e2-2f3473f8a021",
  "date_soumission": "2026-09-07T14:30:00.000Z",
  "demandeur": {
    "structure_type": "association",
    "nom_ou_raison_sociale": "Association Transition & Fabrique Numérique",
    "siret": "83492019400028",
    "secteur_activite": "Médiation numérique & Économie solidaire",
    "adresse": "14 Rue des Métiers et de l'Artisanat",
    "code_postal": "69007",
    "ville": "Lyon",
    "region": "Auvergne-Rhône-Alpes",
    "anciennete_annees": 5
  },
  "projet": {
    "objet_projet": "Mise en place d'un tiers-lieu itinérant d'inclusion numérique rurale",
    "description": "Le projet déploie un véhicule équipé de postes informatiques reconditionnés...",
    "date_debut": "2026-10-01",
    "date_fin": "2027-09-30",
    "programme_id": "prog-innov-2026"
  },
  "budget": {
    "montant_total": 60000,
    "montant_demande": 30000,
    "depenses": [
      {
        "id": "c301666e-...",
        "libelle": "Équipements et serveurs sécurisés",
        "montant": 25000
      }
    ],
    "financements": [
      {
        "id": "d412891f-...",
        "financeur": "Subvention présente sollicitée",
        "montant": 30000,
        "statut": "sollicite"
      }
    ]
  },
  "pieces": [
    {
      "nom_fichier": "releve_identite_bancaire_rib.png",
      "type_declare": "rib",
      "type_suggere_ocr": "rib",
      "texte_ocr": "RELEVE D'IDENTITE BANCAIRE (RIB)\nTitulaire du compte : ASSOCIATION TRANSITION NUMERIQUE\nIBAN : FR76 2004 1010 0508 0012 3456 742...",
      "champs_detectes": {
        "iban": "FR7620041010050800123456742",
        "date": "15/01/2026"
      },
      "fichier_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      "statut_ocr": "succes"
    }
  ],
  "certification_sur_honneur": true
}
```

---

## 🧪 Fonctionnalités Démo Intégrées

Pour accélérer la recette et l'évaluation sans avoir à saisir manuellement des données ou chercher des fichiers locaux :
- **Bouton "Remplir exemple démo"** disponible aux étapes 1, 2 et 3.
- **Boutons "Tests OCR rapides"** à l'étape 4 :
  - `+ Test RIB` : génère un fichier image contenant un relevé d'identité bancaire fictif complet (IBAN, BIC, titulaire) et déclenche l'OCR avec détection automatique du type RIB.
  - `+ Test Devis` : génère un devis d'équipement avec totaux HT / TTC et détection du type Devis.
  - `+ Test Attestation` : génère une attestation de vigilance URSSAF avec SIRET et montants déclarés.

---

## 🔒 Sécurité & Bonnes Pratiques
- **Limitation de taille** : Rejet automatique des fichiers > 10 Mo avec message explicite.
- **Accessibilité** : Navigation complète au clavier, contrastes soignés, attributs `aria-invalid` et `aria-describedby` sur tous les champs de saisie.
- **Impression certifiée** : Feuilles de styles `@media print` masquant les contrôles d'interface et produisant un récépissé officiel net et paginé.
