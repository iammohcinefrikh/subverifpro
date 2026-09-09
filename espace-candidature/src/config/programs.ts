export interface ProgramRequirement {
  name: string;
  mandatory: boolean;
  document_type: string;
  validity_required: boolean;
}

export interface ProgramOption {
  id: string; // program_id from SQL
  uuid: string; // database UUID
  nom: string;
  categorie: string;
  description: string;
  plafond_indicatif: number;
  status: 'ACTIVE' | 'HISTORICAL';
  created_at: string;
  updated_at: string;
  requirements: ProgramRequirement[];
}

export const GRANT_PROGRAMS: ProgramOption[] = [
  {
    id: 'prog-istitmar-tpe',
    uuid: '0c179498-6d57-4b4f-b66a-f7e4930a285c',
    nom: 'Istitmar TPE',
    categorie: 'Maroc PME • Très Petites Entreprises',
    description: 'Programme Maroc PME destiné aux très petites entreprises industrielles existantes ou en amorçage disposant d\'un chiffre d\'affaires annuel inférieur ou égal à 10 MDH. Soutien sous forme de prime à l\'investissement matériel et immatériel.',
    plafond_indicatif: 2000000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:15:19.700236+00',
    requirements: [
      { name: "Pièce d'identité du représentant légal", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Registre de commerce", mandatory: true, document_type: "rc", validity_required: false },
      { name: "Statuts de l'entreprise", mandatory: true, document_type: "statuts", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Déclarations / liasses fiscales", mandatory: true, document_type: "liasses_fiscales", validity_required: true },
      { name: "États financiers", mandatory: true, document_type: "etats_financiers", validity_required: false },
      { name: "Plan d'investissement", mandatory: true, document_type: "plan_investissement", validity_required: false },
      { name: "Devis des investissements", mandatory: true, document_type: "devis", validity_required: false }
    ]
  },
  {
    id: 'prog-tatwir-vert',
    uuid: '0f41a629-305b-44b8-bafb-ef0c89e7cb1e',
    nom: 'TATWIR Croissance Verte',
    categorie: 'Maroc PME • Transition Écologique & PME',
    description: 'Offre intégrée de Maroc PME destinée aux PME industrielles pour les projets de croissance verte, efficacité énergétique, énergies renouvelables, technologies propres, produits éco-conçus et développement de filières industrielles vertes.',
    plafond_indicatif: 1500000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:13:05.219169+00',
    requirements: [
      { name: "Pièce d'identité du représentant légal", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Registre de commerce", mandatory: true, document_type: "rc", validity_required: false },
      { name: "Statuts de l'entreprise", mandatory: true, document_type: "statuts", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Plan d'affaires", mandatory: true, document_type: "business_plan", validity_required: false },
      { name: "Plan d'investissement vert", mandatory: true, document_type: "plan_investissement", validity_required: false },
      { name: "Devis des équipements", mandatory: true, document_type: "devis", validity_required: false },
      { name: "Étude / diagnostic environnemental ou énergétique", mandatory: true, document_type: "etude_environnementale", validity_required: false }
    ]
  },
  {
    id: 'prog-indh-inclusion',
    uuid: '14b12ab1-c22d-4455-9fc8-64752e144b91',
    nom: 'INDH - Inclusion économique',
    categorie: 'INDH • Inclusion des Jeunes & Activités Génératrices de Revenus',
    description: 'Dispositif d\'appui dans le cadre de l\'Initiative Nationale pour le Développement Humain visant notamment l\'inclusion économique, l\'accompagnement des initiatives locales et le développement des activités génératrices de revenus. Les conditions et appels dépendent du territoire et du programme concerné.',
    plafond_indicatif: 300000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:13:56.330509+00',
    requirements: [
      { name: "Pièce d'identité du porteur de projet", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Plan d'affaires / étude du projet", mandatory: true, document_type: "business_plan", validity_required: false },
      { name: "Devis des investissements", mandatory: true, document_type: "devis", validity_required: false },
      { name: "Justificatif du statut juridique de la structure", mandatory: true, document_type: "justificatif_statut", validity_required: false },
      { name: "Attestation CNSS", mandatory: false, document_type: "attestation_cnss", validity_required: true }
    ]
  },
  {
    id: 'prog-mowakaba',
    uuid: '2235b51c-0db2-4cd0-987d-9b138db3f220',
    nom: 'MOWAKABA',
    categorie: 'Maroc PME • Conseil & Transformation Digitale',
    description: 'Programme Maroc PME d\'accompagnement et d\'appui financier couvrant notamment le conseil et l\'expertise technique, la transformation digitale, le développement des produits, les marchés, la stratégie et l\'excellence opérationnelle.',
    plafond_indicatif: 600000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:13:43.669439+00',
    requirements: [
      { name: "Pièce d'identité du représentant légal", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Registre de commerce", mandatory: true, document_type: "rc", validity_required: false },
      { name: "Statuts de l'entreprise", mandatory: true, document_type: "statuts", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "États financiers", mandatory: true, document_type: "etats_financiers", validity_required: false },
      { name: "Plan d'action / plan de transformation", mandatory: true, document_type: "plan_action", validity_required: false }
    ]
  },
  {
    id: 'prog-intelaka-rural',
    uuid: '2cf21294-ddf2-4198-8f4a-e958363deb74',
    nom: 'Intelak Al Moustatmir Al Qarawi',
    categorie: 'Tamwilcom • Entrepreneuriat Rural & TPE',
    description: 'Dispositif Intelaka destiné aux projets et entreprises implantés en milieu rural. Il facilite l\'accès au financement d\'investissement et aux crédits à court terme avec intervention de Tamwilcom.',
    plafond_indicatif: 1200000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:10:38.300929+00',
    requirements: [
      { name: "Pièce d'identité", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Justificatif de domicile", mandatory: true, document_type: "justificatif_domicile", validity_required: false },
      { name: "Business plan / Plan d'affaires", mandatory: true, document_type: "business_plan", validity_required: false },
      { name: "Devis des investissements", mandatory: true, document_type: "devis", validity_required: false },
      { name: "Attestation fiscale", mandatory: false, document_type: "attestation_fiscale", validity_required: true }
    ]
  },
  {
    id: 'prog-istitmar-pme',
    uuid: '574c9b2d-6b07-4176-ac1c-df643fab1ba1',
    nom: 'Istitmar PME',
    categorie: 'Maroc PME • Petites et Moyennes Entreprises Industrielles',
    description: 'Programme Maroc PME destiné aux petites et moyennes entreprises industrielles ayant un chiffre d\'affaires annuel compris entre 10 et 200 MDH. Soutien à l\'investissement matériel et immatériel sous forme de prime à l\'investissement.',
    plafond_indicatif: 10000000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:12:45.721511+00',
    requirements: [
      { name: "Pièce d'identité du représentant légal", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Registre de commerce", mandatory: true, document_type: "rc", validity_required: false },
      { name: "Statuts de l'entreprise", mandatory: true, document_type: "statuts", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Déclarations / liasses fiscales", mandatory: true, document_type: "liasses_fiscales", validity_required: true },
      { name: "États financiers", mandatory: true, document_type: "etats_financiers", validity_required: false },
      { name: "Plan d'investissement", mandatory: true, document_type: "plan_investissement", validity_required: false },
      { name: "Devis des investissements", mandatory: true, document_type: "devis", validity_required: false }
    ]
  },
  {
    id: 'prog-green-invest',
    uuid: 'a38f8bec-9053-4ac6-b308-d0815fad310b',
    nom: 'Green Invest',
    categorie: 'Tamwilcom & Banques • Énergies Renouvelables & Écologie',
    description: 'Mécanisme de cofinancement de projets d\'investissement des entreprises marocaines portant notamment sur les énergies renouvelables, l\'efficacité énergétique, les technologies propres et les investissements verts.',
    plafond_indicatif: 3000000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:11:10.897499+00',
    requirements: [
      { name: "Pièce d'identité du représentant légal", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Registre de commerce", mandatory: true, document_type: "rc", validity_required: false },
      { name: "Statuts de l'entreprise", mandatory: true, document_type: "statuts", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Plan d'affaires / Plan d'investissement", mandatory: true, document_type: "business_plan", validity_required: false },
      { name: "Devis des investissements", mandatory: true, document_type: "devis", validity_required: false },
      { name: "Étude / justificatif environnemental", mandatory: true, document_type: "etude_environnementale", validity_required: false }
    ]
  },
  {
    id: 'prog-forsa',
    uuid: 'bb4ae4d5-1568-4f49-9ac3-f24ddd2e125b',
    nom: 'FORSA',
    categorie: 'Gouvernement • Amorçage & Entrepreneuriat',
    description: 'Programme gouvernemental destiné aux porteurs de projets avec formation, accompagnement et financement. Les éditions réalisées proposaient un financement pouvant atteindre 100 000 DH, comprenant une subvention et un prêt d\'honneur sans intérêt.',
    plafond_indicatif: 100000,
    status: 'HISTORICAL',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:14:09.075982+00',
    requirements: [
      { name: "Pièce d'identité", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Présentation / plan du projet", mandatory: true, document_type: "business_plan", validity_required: false },
      { name: "Devis des investissements", mandatory: false, document_type: "devis", validity_required: false }
    ]
  },
  {
    id: 'prog-start-tpe',
    uuid: 'c0277fbb-ce2e-421b-bd77-467c8f09a33c',
    nom: 'Start-TPE',
    categorie: 'Tamwilcom • Fonds de Roulement & TPE en Démarrage',
    description: 'Financement destiné aux besoins en fonds de roulement des entreprises en démarrage ayant bénéficié d\'un crédit d\'investissement garanti dans le cadre d\'Intelaka.',
    plafond_indicatif: 50000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:10:53.456231+00',
    requirements: [
      { name: "Pièce d'identité", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Attestation / justificatif du crédit d'investissement", mandatory: true, document_type: "attestation_credit", validity_required: false },
      { name: "Justificatif d'activité", mandatory: true, document_type: "justificatif_activite", validity_required: false }
    ]
  },
  {
    id: 'prog-tatwir-rd',
    uuid: 'c3ac36b1-e37c-4a71-adae-193ac87cec8f',
    nom: 'TATWIR R&D et Innovation',
    categorie: 'Maroc PME • Recherche, Développement & Innovation Industrielle',
    description: 'Programme Maroc PME destiné aux entreprises industrielles, startups et projets collaboratifs portant sur la recherche et développement, le développement technologique, l\'innovation produit ou procédé et la valorisation des brevets.',
    plafond_indicatif: 1200000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:13:27.737772+00',
    requirements: [
      { name: "Pièce d'identité du représentant légal", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Registre de commerce", mandatory: true, document_type: "rc", validity_required: false },
      { name: "Statuts de l'entreprise", mandatory: true, document_type: "statuts", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Dossier de projet R&D / Innovation", mandatory: true, document_type: "projet_rd", validity_required: false },
      { name: "Plan de financement du projet", mandatory: true, document_type: "plan_financement", validity_required: false },
      { name: "Devis et offres fournisseurs", mandatory: true, document_type: "devis", validity_required: false }
    ]
  },
  {
    id: 'prog-intelaka',
    uuid: 'f7374af1-f356-4307-acb4-f16199715c8e',
    nom: 'Intelaka / Damane Intelak',
    categorie: 'Tamwilcom & Banques • Financement de l\'Entrepreneuriat',
    description: 'Programme intégré d\'appui et de financement de l\'entrepreneuriat destiné notamment aux jeunes porteurs de projets, auto-entrepreneurs, micro-entreprises et TPE. Damane Intelak facilite l\'accès aux crédits d\'investissement et d\'exploitation via une garantie publique.',
    plafond_indicatif: 1200000,
    status: 'ACTIVE',
    created_at: '2026-09-08 11:06:50.579469+00',
    updated_at: '2026-09-08 11:10:23.043926+00',
    requirements: [
      { name: "Pièce d'identité", mandatory: true, document_type: "piece_identite", validity_required: false },
      { name: "Relevé d'identité bancaire", mandatory: true, document_type: "rib", validity_required: false },
      { name: "Justificatif de domicile", mandatory: true, document_type: "justificatif_domicile", validity_required: false },
      { name: "Business plan / Plan d'affaires", mandatory: true, document_type: "business_plan", validity_required: false },
      { name: "Devis des investissements", mandatory: true, document_type: "devis", validity_required: false }
    ]
  }
];

/**
 * Recherche robuste d'un programme par son identifiant fonctionnel (program_id), son UUID SQL ou un ancien alias
 */
export function findProgram(idOrUuid?: string): ProgramOption | undefined {
  if (!idOrUuid) return undefined;
  const target = idOrUuid.toLowerCase().trim();

  // Alias rétrocompatibilité
  if (target === 'forsa-2025') return GRANT_PROGRAMS.find((p) => p.id === 'prog-forsa');
  if (target === 'prog-maroc-digital') return GRANT_PROGRAMS.find((p) => p.id === 'prog-tatwir-rd');
  if (target === 'prog-maroc-vert') return GRANT_PROGRAMS.find((p) => p.id === 'prog-green-invest');
  if (target === 'prog-artisanat-tourisme') return GRANT_PROGRAMS.find((p) => p.id === 'prog-istitmar-tpe');

  return GRANT_PROGRAMS.find(
    (p) => p.id.toLowerCase() === target || p.uuid.toLowerCase() === target
  );
}
