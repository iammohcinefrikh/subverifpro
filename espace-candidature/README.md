# SubVerif — Espace Candidature & Pipeline OCR

**SubVerif (Espace Candidature)** est la plateforme dématérialisée permettant aux porteurs de projets (entreprises, associations, indépendants, structures publiques) de déposer leur dossier de subvention, de suivre leur avancement et d'effectuer la régularisation de leurs pièces justificatives grâce à un **moteur OCR 100% côté client**.

Ce projet constitue l'application **Espace Candidat** au sein de l'écosystème **SubVerif Pro**, opérant en synergie avec le **Dashboard d'Instruction** (`/dashboard`).

---

## 🌟 Fonctionnalités Principales

### 1. 🏛️ Landing Page Institutionnelle (`/`)
- Présentation claire des programmes d'aides et subventions publiques (ex. Maroc PME, Intelaka, Green Invest, etc.).
- Parcours usager simplifié en 3 étapes avec illustrations vectorielles immersives.
- Garanties de sécurité, souveraineté et conformité des données transmises.
- Accès direct au dépôt de dossier ou à la connexion à l'espace personnel.

### 2. 📋 Formulaire de Candidature Multi-Étapes (`/candidature`)
Parcours guidé en 5 étapes avec validation en temps réel ([React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)) :
- **Étape 1 — Profil Demandeur** : Forme juridique, raison sociale, contrôle de conformité SIRET / ICE, coordonnées du dirigeant, sélection rapide de profils démo.
- **Étape 2 — Projet & Programme** : Objet de l'opération, calendrier prévisionnel (dates début/fin avec contrôle de cohérence temporelle) et sélection du programme visé.
- **Étape 3 — Budget & Plan de Financement** : Budget global, subvention sollicitée, tableau dynamique des postes de dépenses et répartition des cofinanceurs.
- **Étape 4 — Dépôt & Pipeline OCR des Pièces** : Glisser-déposer de justificatifs (PDF, JPG, PNG), reconnaissance de texte automatique, catégorisation intelligente (RIB, Devis, Statuts, Pièce d'identité, Attestation) et extraction indicative par expressions régulières (IBAN, SIRET, montants, dates).
- **Étape 5 — Récapitulatif, Audit & Envoi** : Contrôle de complétude préalable, attestation sur l'honneur, transmission sécurisée en POST JSON vers l'orchestrateur (Webhook) et génération d'un reçu téléchargeable/imprimable avec identifiant unique UUID v4.

### 3. 📊 Dashboard Candidat & Suivi de Dossier (`/dashboard`)
- **Timeline de statut en direct** : Suivi chronologique de l'instruction (*Dossier déposé*, *Vérification automatique*, *Instruction administrative*, *Décision de commission*).
- **Gestion des pièces complémentaires** : Détection ciblée des pièces manquantes ou non conformes, avec possibilité de téléversement immédiat et traitement OCR instantané.
- **Tableau de bord documentaire** : Inventaire des pièces jointes, type détecté, horodatage et statut d'analyse.
- **Bascule démo interactive** : Possibilité d'émuler instantanément 10 profils de candidats marocains réels et variés (PME, TPE, Coopérative, R&D, etc.).

### 4. 🔐 Authentification & Espace Sécurisé (`/login`)
- Authentification par identifiants (email & mot de passe avec hachage scrypt).
- Modal interactif de sélection directe des candidats de démonstration pour fluidifier les revues et recettes techniques.
- Gestion de session par token JWT et compatibilité avec la base de données PostgreSQL / Supabase.

---

## 🔬 Pipeline OCR 100% Côté Client

1. **Extraction de texte native pour PDF vectoriels** : Récupération instantanée du flux textuel via [`pdfjs-dist`](https://github.com/mozilla/pdf.js).
2. **Fallback automatique haute résolution** : Pour les PDF scannés ou images non sélectionnables, pixellisation automatique de chaque page dans un `<canvas>` haute résolution (scale 1.5x) transmise à [`tesseract.js`](https://github.com/naptha/tesseract.js) (modèle français).
3. **Classification documentaire lexicale** : Détection contextuelle basée sur des dictionnaires sémantiques ciblés (*RIB, Devis, Liasses fiscales, Statuts, CIN, etc.*).
4. **Extraction ciblée par Regex** : Extraction non destructive de champs clés (IBAN, SIRET/ICE, montants en DH/EUR, dates) avec prévisualisation et correction manuelle par l'utilisateur.

---

## 🛠️ Stack Technique

| Domaine | Technologies |
|---|---|
| **Framework & Bundler** | [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Routage** | [React Router v7](https://reactrouter.com/) |
| **Styling & UI** | [Tailwind CSS v3](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Formulaires & Schémas** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Traitement OCR & Documents** | [Tesseract.js v7](https://tesseract.projectnaptha.com/), [PDF.js v4](https://mozilla.github.io/pdf.js/) |
| **Identifiants & Utilitaires** | [UUID v4](https://github.com/uuidjs/uuid) |
| **Persistance & Dev Server** | PostgreSQL / Supabase, Custom Vite Middleware API |

---

## 📂 Structure du Répertoire

```text
espace-candidature/
├── database/                    # Scripts SQL de migration et de seed
│   ├── auth_users.sql           # Schéma et seed initial des utilisateurs
│   ├── link_candidate_users_fk.sql # Clés étrangères et profils complets
│   └── programs_rows.sql        # Référentiel des programmes de subventions
├── public/                      # Assets statiques et favicons
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── dashboard/           # Timeline, table documentaire, pièces manquantes
│   │   ├── documents/           # Dropzone, carte de document, modal OCR
│   │   ├── feedback/            # Alertes, modal de confirmation
│   │   ├── landing/             # Illustrations vectorielles & sections landing
│   │   ├── layout/              # Header, Footer, Stepper de navigation
│   │   ├── modals/              # Sélecteur de candidats de test
│   │   ├── steps/               # Étapes 1 à 5 du wizard de candidature
│   │   └── ui/                  # Boutons, badges, inputs, selects
│   ├── config/                  # Mock candidates, référentiel de programmes et pièces
│   ├── context/                 # AuthContext & hooks d'état d'authentification
│   ├── hooks/                   # useWizardForm
│   ├── pages/                   # LandingPage, LoginPage, DashboardPage, WizardPage
│   ├── services/                # OCR, regex, audit documentaire, webhook, JWT
│   ├── types/                   # Définitions TypeScript (auth, form, ocr, webhook)
│   ├── App.tsx                  # Définition des routes applicatives
│   ├── index.css                # Directives Tailwind et styles globaux
│   └── main.tsx                 # Point d'entrée React
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18 ou v20+
- Gestionnaire de paquets `npm` ou `pnpm`

### 2. Installation
```bash
npm install
```

### 3. Configuration des variables d'environnement
Créez un fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

Variables requises :
```env
# URL du Webhook de traitement externe
VITE_WEBHOOK_URL=https://stg-orch-api.abafusion.ai/webhook/webhook-v93p8wtjgrud6dksfbtxdn5m/condidat

# Connexion directe Postgres (optionnelle pour dev API plugin)
DIRECT_URL="postgresql://user:password@host:5432/postgres"
```

### 4. Lancement du serveur de développement
```bash
npm run dev
```
L'application sera accessible sur [http://localhost:5173](http://localhost:5173).

### 5. Compilation pour production
```bash
npm run build
```
Les fichiers statiques optimisés seront générés dans le dossier `dist/`.

---

## 📡 Spécification du Webhook Payload

À la soumission du dossier, un payload HTTP `POST` au format JSON est transmis au webhook configuré :

```json
{
  "dossier_id": "8f3b26c7-7e61-4fa3-95e2-2f3473f8a021",
  "date_soumission": "2026-09-09T10:30:00.000Z",
  "demandeur": {
    "structure_type": "entreprise",
    "nom_ou_raison_sociale": "Atlas Technologies SARL",
    "siret": "83492019400028",
    "secteur_activite": "Technologies de l'information",
    "adresse": "Boulevard Zerktouni, Casablanca",
    "code_postal": "20000",
    "ville": "Casablanca",
    "region": "Casablanca-Settat",
    "anciennete_annees": 4
  },
  "projet": {
    "objet_projet": "Modernisation de la chaîne logistique et automatisation OCR",
    "description": "Acquisition de serveurs et licences pour traitement dématérialisé...",
    "date_debut": "2026-10-01",
    "date_fin": "2027-09-30",
    "programme_id": "prog-istitmar-tpe"
  },
  "budget": {
    "montant_total": 1200000,
    "montant_demande": 300000,
    "depenses": [
      {
        "id": "c301666e-...",
        "libelle": "Infrastructure serveurs et calcul",
        "montant": 600000
      }
    ],
    "financements": [
      {
        "id": "d412891f-...",
        "financeur": "Subvention sollicitée",
        "montant": 300000,
        "statut": "sollicite"
      }
    ]
  },
  "pieces": [
    {
      "nom_fichier": "rib_societe.png",
      "type_declare": "rib",
      "type_suggere_ocr": "rib",
      "texte_ocr": "RELEVE D'IDENTITE BANCAIRE...",
      "champs_detectes": {
        "iban": "MA64011510000001234567890189",
        "date": "08/09/2026"
      },
      "fichier_base64": "data:image/png;base64,...",
      "statut_ocr": "succes"
    }
  ],
  "certification_sur_honneur": true
}
```

---

## 🔒 Sécurité et Confidentialité
- **Exclusion stricte des identifiants** : Les clés privées et secrets (`.env`) sont strictement ignorés du contrôle de version.
- **Zéro fuite côté client** : Le traitement OCR s'exécute dans un Web Worker isolé sur la machine de l'utilisateur.
- **Contrôles d'intégrité** : Vérification de la taille des fichiers (max 10 Mo) et formats autorisés (PDF, JPEG, PNG).
