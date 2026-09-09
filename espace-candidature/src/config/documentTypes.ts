import type { DocumentType } from '../types/ocr';

export interface DocumentTypeDefinition {
  type: DocumentType;
  label: string;
  description: string;
  keywords: string[];
  colorBadge: string;
}

export const DOCUMENT_TYPE_DEFINITIONS: DocumentTypeDefinition[] = [
  {
    type: 'piece_identite',
    label: "Pièce d'identité du représentant légal (CNIE/Passeport)",
    description: "Carte Nationale d'Identité Électronique (CNIE) ou passeport valide du porteur / dirigeant",
    keywords: [
      'cnie',
      "carte nationale d'identite",
      "carte nationale d'identité",
      'royaume du maroc',
      'passeport',
      'titre de sejour',
      'titre de séjour',
      'nationalite',
      'date de naissance'
    ],
    colorBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    type: 'rc',
    label: 'Registre du Commerce (Modèle J / RC)',
    description: 'Extrait du Registre du Commerce récent délivré par le Tribunal de Commerce',
    keywords: [
      'registre du commerce',
      'registre de commerce',
      'tribunal de premiere instance',
      'tribunal de commerce',
      'modele j',
      'modèle j',
      'numero rc',
      'n° rc',
      'capital social',
      'greffe'
    ],
    colorBadge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    type: 'statuts',
    label: "Statuts de l'entreprise ou PV constitutif",
    description: "Statuts enregistrés, PV d'assemblée générale constitutive ou modificative",
    keywords: [
      'statuts',
      'statuts constitutifs',
      'sarl',
      'societe anonyme',
      'société à responsabilité limitée',
      'objet social',
      'siege social',
      'siège social',
      'associes',
      'parts sociales',
      'gerant'
    ],
    colorBadge: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    type: 'rib',
    label: "Relevé d'Identité Bancaire (RIB)",
    description: 'Attestation de compte bancaire avec IBAN et BIC au nom de la structure candidate',
    keywords: [
      'iban',
      'bic',
      'rib',
      "releve d'identite bancaire",
      "relevé d'identité bancaire",
      'titulaire du compte',
      'domiciliation',
      'code banque',
      'code guichet',
      'cle rib',
      'attijariwafa',
      'banque populaire',
      'bank of africa',
      'cih',
      'bmce'
    ],
    colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    type: 'devis',
    label: 'Devis / Proposition commerciale / Facture proforma',
    description: 'Offres chiffrées des prestataires ou fournisseurs avec prix unitaire, TVA et total TTC',
    keywords: [
      'devis',
      'proposition commerciale',
      'bon de commande',
      'proforma',
      'total ht',
      'total ttc',
      'montant ht',
      'montant ttc',
      'tva',
      'conditions de reglement'
    ],
    colorBadge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    type: 'liasses_fiscales',
    label: 'Déclarations / Liasses fiscales certifiées',
    description: 'Bilan fiscal, CPC et tableau des amortissements avec accusé DGI',
    keywords: [
      'liasse fiscale',
      'liasses fiscales',
      'cpc',
      'compte de produits et charges',
      'resultat fiscal',
      'chiffre d affaires',
      'dgi',
      'direction generale des impots',
      'declaration fiscale'
    ],
    colorBadge: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    type: 'etats_financiers',
    label: 'États financiers & Bilans comptables',
    description: 'États de synthèse, bilan certifié par l\'expert-comptable ou commissaire aux comptes',
    keywords: [
      'etats financiers',
      'états financiers',
      'bilan comptable',
      'actif passif',
      'expert-comptable',
      'commissaire aux comptes',
      'situation financiere'
    ],
    colorBadge: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  {
    type: 'plan_investissement',
    label: "Plan d'investissement matériel / immatériel",
    description: "Programme prévisionnel d'acquisition des équipements, machines et aménagements",
    keywords: [
      "plan d'investissement",
      "plan d investissement",
      'programme d investissement',
      'investissements materiels',
      'equipements industriels',
      'calendrier de deploiement'
    ],
    colorBadge: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    type: 'business_plan',
    label: "Plan d'affaires / Business Plan / Étude de projet",
    description: "Étude de faisabilité, modèle économique, étude de marché et prévisions d'exploitation",
    keywords: [
      'business plan',
      "plan d'affaires",
      "plan d affaires",
      'etude de marche',
      'modele economique',
      'previsionnel',
      'rentabilite',
      'chiffre d affaires previsionnel'
    ],
    colorBadge: 'bg-lime-50 text-lime-700 border-lime-200'
  },
  {
    type: 'etude_environnementale',
    label: 'Étude / Diagnostic environnemental ou énergétique',
    description: "Audit d'efficacité énergétique, bilan carbone ou étude d'impact environnemental",
    keywords: [
      'audit energetique',
      'efficacite energetique',
      'etude d impact environnemental',
      'diagnostic vert',
      'bilan carbone',
      'transition ecologique',
      'energies renouvelables'
    ],
    colorBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  {
    type: 'attestation_cnss',
    label: 'Attestation de régularité CNSS',
    description: 'Attestation prouvant que l\'employeur est à jour de ses cotisations sociales',
    keywords: [
      'cnss',
      'caisse nationale de securite sociale',
      'regularite cnss',
      'affiliation cnss',
      'cotisations sociales',
      'masse salariale'
    ],
    colorBadge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    type: 'attestation_fiscale',
    label: 'Attestation de régularité fiscale (DGI)',
    description: 'Bulletin de régularité de la Direction Générale des Impôts (DGI)',
    keywords: [
      'attestation fiscale',
      'regularite fiscale',
      'quitus fiscal',
      'direction generale des impots',
      'dgi maroc',
      'situation fiscale'
    ],
    colorBadge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  },
  {
    type: 'plan_action',
    label: "Plan d'action / Plan de transformation",
    description: 'Feuille de route stratégique, conseil technique ou plan de digitalisation',
    keywords: [
      "plan d'action",
      "plan d action",
      'transformation digitale',
      'plan strategique',
      'jalons',
      'plan de deploiement',
      'excellence operationnelle'
    ],
    colorBadge: 'bg-amber-50 text-amber-800 border-amber-300'
  },
  {
    type: 'justificatif_domicile',
    label: 'Justificatif de domicile / Certificat de résidence',
    description: 'Quittance d\'électricité/eau, bail commercial ou certificat de résidence administratif',
    keywords: [
      'justificatif de domicile',
      'bail commercial',
      'certificat de residence',
      'quittance lydec',
      'quittance radeema',
      'facture electricite'
    ],
    colorBadge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    type: 'attestation_credit',
    label: "Attestation de crédit d'investissement",
    description: "Accord bancaire de prêt d'investissement garanti (ex: Tamwilcom / Intelaka)",
    keywords: [
      "credit d'investissement",
      'attestation de pret',
      'accord de financement',
      'garantie tamwilcom',
      'banque accord',
      'pret bancaire'
    ],
    colorBadge: 'bg-blue-50 text-blue-800 border-blue-300'
  },
  {
    type: 'justificatif_activite',
    label: "Justificatif d'activité",
    description: "Autorisation d'exercice, carte d'auto-entrepreneur, patente ou facture récente",
    keywords: [
      "justificatif d'activite",
      'auto-entrepreneur',
      'taxe professionnelle',
      'patente',
      'autorisation administrative'
    ],
    colorBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  {
    type: 'projet_rd',
    label: 'Dossier de projet R&D / Innovation',
    description: 'Descriptif technique d\'ingénierie, brevet, prototype et partenariats universitaires',
    keywords: [
      'projet r&d',
      'recherche et developpement',
      'brevet',
      'prototype',
      'innovation industrielle',
      'transfert technologique'
    ],
    colorBadge: 'bg-indigo-50 text-indigo-800 border-indigo-300'
  },
  {
    type: 'plan_financement',
    label: 'Plan de financement du projet',
    description: 'Tableau équilibré des ressources (fonds propres, primes, emprunts) et emplois',
    keywords: [
      'plan de financement',
      'fonds propres',
      'subvention sollicitee',
      'financement bancaire',
      'equilibre financier'
    ],
    colorBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  {
    type: 'justificatif_statut',
    label: 'Justificatif du statut juridique de la structure',
    description: 'Récépissé de dépôt légal, agrément coopérative ou arrêté préfectoral',
    keywords: [
      'statut juridique',
      'recepisse de depot',
      'cooperative',
      'agrement',
      'loi 1901',
      'odco'
    ],
    colorBadge: 'bg-slate-50 text-slate-700 border-slate-300'
  },
  {
    type: 'attestation',
    label: 'Autre attestation sur l\'honneur / administrative',
    description: 'Attestation sur l\'honneur, d\'assurance ou de non-condamnation',
    keywords: [
      'attestation sur l honneur',
      'declaration sur l honneur',
      'certifie que',
      'engagement'
    ],
    colorBadge: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    type: 'formulaire',
    label: 'Formulaire / Dossier de candidature officiel',
    description: 'Dossier type rempli et paraphé par le candidat',
    keywords: [
      'formulaire de demande',
      'dossier de subvention',
      'cahier des charges',
      'candidature'
    ],
    colorBadge: 'bg-cyan-50 text-cyan-800 border-cyan-300'
  },
  {
    type: 'autre',
    label: 'Autre document complémentaire',
    description: 'Tout autre document justificatif d\'appui',
    keywords: [],
    colorBadge: 'bg-slate-100 text-slate-700 border-slate-200'
  }
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

export function getDocumentTypeDefinition(type: string): DocumentTypeDefinition | undefined {
  return DOCUMENT_TYPE_DEFINITIONS.find((d) => d.type === type);
}

