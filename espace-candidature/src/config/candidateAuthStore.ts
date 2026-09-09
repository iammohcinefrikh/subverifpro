import type { MockCandidateUser } from '../types/auth';

export const INITIAL_MOCK_USERS: MockCandidateUser[] = [
  // 1. ATLAS TECH SOLUTIONS SARL (Statut : documents_manquants)
  {
    id: 'user-atlas-001',
    email: 'youssef@atlastech-solutions.ma',
    password: 'password123',
    nomCourt: 'ATLAS TECH SOLUTIONS',
    structureNom: 'ATLAS TECH SOLUTIONS SARL',
    structureType: 'entreprise',
    badge: 'Digital & IA',
    demandeur: {
      structure_type: 'entreprise',
      nom_ou_raison_sociale: 'ATLAS TECH SOLUTIONS SARL',
      siret: '002345678000045',
      secteur_activite: 'Technologies de l\'information, Cloud & Intelligence Artificielle',
      adresse: '124 Boulevard d\'Anfa, 5ème étage',
      code_postal: '20000',
      ville: 'Casablanca',
      region: 'Casablanca-Settat',
      anciennete_annees: 4,
      nom_representant: 'EL AMRANI',
      prenom_representant: 'Youssef',
      date_naissance_representant: '1988-04-14',
      cin_representant: 'BE890123',
      email_representant: 'youssef@atlastech-solutions.ma',
      telephone_representant: '0661234567'
    },
    projet: {
      objet_projet: 'Plateforme Cloud & Infrastructure IA Souveraine',
      description: 'Acquisition et déploiement d\'une infrastructure serveurs GPU haute performance et serveurs Cloud pour accélérer le traitement de données et l\'entraînement de modèles IA d\'entreprise au Maroc.',
      date_debut: '2026-10-01',
      date_fin: '2027-09-30',
      programme_id: 'prog-tatwir-rd'
    },
    budget: {
      montant_total: 480000,
      montant_demande: 288000,
      depenses: [
        { id: 'dep-1', libelle: 'Serveurs de calcul Cloud & GPU Hardware (selon Devis Fournisseur)', montant: 288000 },
        { id: 'dep-2', libelle: 'Installation réseau haute disponibilité & baie rack', montant: 72000 },
        { id: 'dep-3', libelle: 'Déploiement logiciel IA & cybersécurité Linux', montant: 60000 },
        { id: 'dep-4', libelle: 'Formation technique des ingénieurs & accompagnement', montant: 60000 }
      ],
      financements: [
        { id: 'fin-1', financeur: 'Subvention sollicitée (TATWIR R&D et Innovation)', montant: 288000, statut: 'sollicite' },
        { id: 'fin-2', financeur: 'Apport propre ATLAS TECH SOLUTIONS SARL', montant: 112000, statut: 'acquis' },
        { id: 'fin-3', financeur: 'Financement bancaire d\'investissement', montant: 80000, statut: 'acquis' }
      ]
    },
    dossier: {
      dossier_id: 'DOS-2026-ATLAS-8942',
      date_soumission: '2026-09-02T09:30:00.000Z',
      statut: 'documents_manquants',
      pieces_requises: ['piece_identite', 'rc', 'statuts', 'rib', 'devis', 'projet_rd'],
      remarques_instructeur: 'Dossier préliminaire recevable mais incomplet. Veuillez joindre un Relevé d\'Identité Bancaire (RIB) officiel au format PDF/image ainsi que le Devis détaillé signé de vos équipements informatiques.',
      pieces: [
        {
          nom_fichier: 'CNIE_EL_AMRANI_Youssef.pdf',
          type_declare: 'piece_identite',
          type_suggere_ocr: 'piece_identite',
          texte_ocr: 'ROYAUME DU MAROC - CARTE NATIONALE D IDENTITE CIN BE890123 Nom: EL AMRANI Prenom: Youssef Né le 14/04/1988 Casablanca',
          champs_detectes: { date: '14/04/1988' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'Registre_Commerce_ATLAS_TECH.pdf',
          type_declare: 'rc',
          type_suggere_ocr: 'rc',
          texte_ocr: 'TRIBUNAL DE COMMERCE DE CASABLANCA REGISTRE DU COMMERCE N° 458912 RC Casablanca ICE: 002345678000045 SARL ATLAS TECH SOLUTIONS',
          champs_detectes: { siret: '002345678000045' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'Statuts_Constitutifs_Signes.pdf',
          type_declare: 'statuts',
          type_suggere_ocr: 'statuts',
          texte_ocr: 'STATUTS DE LA SOCIETE A RESPONSABILITE LIMITEE ATLAS TECH SOLUTIONS SARL Capital social: 500 000 DH Siège: Casablanca',
          champs_detectes: { montant: '500 000 DH' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'Projet_RD_Cloud_Maroc.pdf',
          type_declare: 'projet_rd',
          type_suggere_ocr: 'projet_rd',
          texte_ocr: 'DOSSIER TECHNIQUE ET PROGRAMME DE R&D 2026-2027 Infrastructure Souveraine de Calcul Distribué',
          champs_detectes: {},
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        }
      ]
    }
  },

  // 2. COOPÉRATIVE BIO ATLAS (Statut : en_cours_examen)
  {
    id: 'user-bio-002',
    email: 'amina@bio-atlas.ma',
    password: 'password123',
    nomCourt: 'COOPÉRATIVE BIO ATLAS',
    structureNom: 'COOPÉRATIVE AGRICOLE BIO ATLAS',
    structureType: 'association',
    badge: 'Agriculture & Bio',
    demandeur: {
      structure_type: 'association',
      nom_ou_raison_sociale: 'COOPÉRATIVE AGRICOLE BIO ATLAS',
      siret: '001890234000078',
      secteur_activite: 'Agriculture biologique, transformation de plantes aromatiques',
      adresse: 'Douar Ait Daoud, Route de la Vallée',
      code_postal: '44000',
      ville: 'Essaouira',
      region: 'Marrakech-Safi',
      anciennete_annees: 6,
      nom_representant: 'BENKIRANE',
      prenom_representant: 'Amina',
      date_naissance_representant: '1984-11-23',
      cin_representant: 'N234901',
      email_representant: 'amina@bio-atlas.ma',
      telephone_representant: '0663456789'
    },
    projet: {
      objet_projet: 'Unité d\'Éco-Distillation Solaire d\'Huiles Essentielles',
      description: 'Modernisation de l\'unité d\'extraction locale avec distillateurs solaires inox et mise en conformité certification biologique européenne pour l\'export.',
      date_debut: '2026-08-01',
      date_fin: '2027-07-31',
      programme_id: 'prog-green-invest'
    },
    budget: {
      montant_total: 210000,
      montant_demande: 140000,
      depenses: [
        { id: 'dep-b1', libelle: 'Distillateur solaire inox 500L et échangeur thermique', montant: 140000 },
        { id: 'dep-b2', libelle: 'Aménagement salle blanche et conditionnement verre', montant: 45000 },
        { id: 'dep-b3', libelle: 'Audit et certification biologique Ecocert', montant: 25000 }
      ],
      financements: [
        { id: 'fin-b1', financeur: 'Subvention sollicitée (Green Invest)', montant: 140000, statut: 'sollicite' },
        { id: 'fin-b2', financeur: 'Fonds associatifs de la coopérative', montant: 70000, statut: 'acquis' }
      ]
    },
    dossier: {
      dossier_id: 'DOS-2026-BIO-3319',
      date_soumission: '2026-08-25T14:15:00.000Z',
      statut: 'en_cours_examen',
      pieces_requises: ['piece_identite', 'rib', 'business_plan', 'devis', 'justificatif_statut'],
      remarques_instructeur: 'Dossier complet et pièces conformes. Instruction technique en cours auprès des experts de la commission environnementale.',
      pieces: [
        {
          nom_fichier: 'CNIE_BENKIRANE_Amina.png',
          type_declare: 'piece_identite',
          type_suggere_ocr: 'piece_identite',
          texte_ocr: 'ROYAUME DU MAROC CARTE NATIONALE CIN N234901 Nom: BENKIRANE Prenom: Amina',
          champs_detectes: {},
          fichier_base64: 'data:image/png;base64,iVBORw0KGgo...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'RIB_Attijariwafa_CoopBioAtlas.pdf',
          type_declare: 'rib',
          type_suggere_ocr: 'rib',
          texte_ocr: 'RELEVE D IDENTITE BANCAIRE ATTIJARIWAFA BANK IBAN: MA64 0077 8000 0987 6543 2109 88 BIC: BCMAMAMC Titulaire: COOPERATIVE BIO ATLAS',
          champs_detectes: { iban: 'MA64 0077 8000 0987 6543 2109 88' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'Devis_Distillateur_Inox_Solaire.pdf',
          type_declare: 'devis',
          type_suggere_ocr: 'devis',
          texte_ocr: 'DEVIS N° DEV-2026-8891 Distillateur solaire 500L Inox 316L Total TTC: 140 000 DH Fournisseur: ATLAS AGRO EQUIPEMENT ICE 001988234000012',
          champs_detectes: { montant: '140 000 DH' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'Statuts_Agrement_Cooperative.pdf',
          type_declare: 'justificatif_statut',
          type_suggere_ocr: 'justificatif_statut',
          texte_ocr: 'AGREMENT ODCO OFFICE DE DEVELOPPEMENT DE LA COOPERATION N° 8492/COOP Coopérative Agricole Bio Atlas',
          champs_detectes: {},
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'Plan_Affaires_BioAtlas_2026.pdf',
          type_declare: 'business_plan',
          type_suggere_ocr: 'business_plan',
          texte_ocr: 'PLAN D AFFAIRES ET ETUDE DE MARCHE Valorisation des plantes aromatiques et médicinales du Haut-Atlas',
          champs_detectes: {},
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        }
      ]
    }
  },

  // 3. MENARA INNOVATION SARL (Statut : valide)
  {
    id: 'user-menara-003',
    email: 'karim@menara-innov.ma',
    password: 'password123',
    nomCourt: 'MENARA INNOVATION',
    structureNom: 'MENARA INNOVATION SARL',
    structureType: 'entreprise',
    badge: 'Industrie & Énergie',
    demandeur: {
      structure_type: 'entreprise',
      nom_ou_raison_sociale: 'MENARA INNOVATION SARL',
      siret: '001556789000099',
      secteur_activite: 'Ingénierie mécatronique et capteurs IoT industriels',
      adresse: 'Zone Industrielle Sidi Ghanem, Lot 44',
      code_postal: '40000',
      ville: 'Marrakech',
      region: 'Marrakech-Safi',
      anciennete_annees: 5,
      nom_representant: 'TAZI',
      prenom_representant: 'Karim',
      date_naissance_representant: '1985-06-18',
      cin_representant: 'EE450123',
      email_representant: 'karim@menara-innov.ma',
      telephone_representant: '0661998877'
    },
    projet: {
      objet_projet: 'Ligne Pilote de Capteurs IoT pour l\'Efficacité Énergétique',
      description: 'Industrialisation de sondes thermiques et débitmètres communicants LoRaWAN pour les usines de transformation agro-industrielle.',
      date_debut: '2026-06-01',
      date_fin: '2027-05-31',
      programme_id: 'prog-tatwir-vert'
    },
    budget: {
      montant_total: 520000,
      montant_demande: 260000,
      depenses: [
        { id: 'dep-m1', libelle: 'Bancs de test et machines de soudage CMS', montant: 260000 },
        { id: 'dep-m2', libelle: 'Moule d\'injection boîtier étanche IP68', montant: 140000 },
        { id: 'dep-m3', libelle: 'Certification CEM et conformité normes radio', montant: 120000 }
      ],
      financements: [
        { id: 'fin-m1', financeur: 'Subvention accordée (TATWIR Croissance Verte)', montant: 260000, statut: 'acquis' },
        { id: 'fin-m2', financeur: 'Apport propre Menara Innovation SARL', montant: 260000, statut: 'acquis' }
      ]
    },
    dossier: {
      dossier_id: 'DOS-2026-MENARA-1102',
      date_soumission: '2026-07-10T11:00:00.000Z',
      statut: 'valide',
      pieces_requises: ['piece_identite', 'rc', 'statuts', 'rib', 'devis'],
      remarques_instructeur: 'Félicitations ! La commission mixte a émis un avis très favorable. La convention d\'attribution de subvention pour un montant de 260 000 DH a été signée.',
      decision_date: '2026-08-15T10:00:00.000Z',
      pieces: [
        {
          nom_fichier: 'CIN_Karim_Tazi.pdf',
          type_declare: 'piece_identite',
          type_suggere_ocr: 'piece_identite',
          texte_ocr: 'ROYAUME DU MAROC CIN EE450123 Nom TAZI Karim',
          champs_detectes: {},
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'RC_Menara_Innovation.pdf',
          type_declare: 'rc',
          type_suggere_ocr: 'rc',
          texte_ocr: 'REGISTRE DU COMMERCE MARRAKECH ICE 001556789000099 RC 88712',
          champs_detectes: { siret: '001556789000099' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'RIB_BanquePopulaire_Menara.pdf',
          type_declare: 'rib',
          type_suggere_ocr: 'rib',
          texte_ocr: 'BANQUE POPULAIRE RIB IBAN MA64 0117 8000 0012 3456 7890 12',
          champs_detectes: { iban: 'MA64 0117 8000 0012 3456 7890 12' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        }
      ]
    }
  },

  // 4. ATELIER ARTISANAT DU SUD (Statut : en_attente)
  {
    id: 'user-artisanat-004',
    email: 'rachid@artisanat-moderne.ma',
    password: 'password123',
    nomCourt: 'ATELIER ARTISANAT DU SUD',
    structureNom: 'ENTREPRISE INDIVIDUELLE RACHID EL IDRISSI',
    structureType: 'independant',
    badge: 'Artisanat & Patrimoine',
    demandeur: {
      structure_type: 'independant',
      nom_ou_raison_sociale: 'ATELIER ARTISANAT DU SUD',
      siret: '002998765000031',
      secteur_activite: 'Maroquinerie d\'art, tissage et travail du cuir',
      adresse: 'Derb El Mokri, Médina',
      code_postal: '45000',
      ville: 'Ouarzazate',
      region: 'Drâa-Tafilalet',
      anciennete_annees: 3,
      nom_representant: 'EL IDRISSI',
      prenom_representant: 'Rachid',
      date_naissance_representant: '1992-03-10',
      cin_representant: 'PB112233',
      email_representant: 'rachid@artisanat-moderne.ma',
      telephone_representant: '0671239845'
    },
    projet: {
      objet_projet: 'Équipement moderne d\'atelier et numérisation des ventes',
      description: 'Acquisition de machines à coudre industrielles de précision pour le cuir et développement d\'une vitrine numérique pour l\'export.',
      date_debut: '2026-11-01',
      date_fin: '2027-04-30',
      programme_id: 'prog-istitmar-tpe'
    },
    budget: {
      montant_total: 95000,
      montant_demande: 65000,
      depenses: [
        { id: 'dep-a1', libelle: 'Machines à coudre triple entraînement et outillage de coupe', montant: 65000 },
        { id: 'dep-a2', libelle: 'Création studio photo produits et boutique e-commerce', montant: 30000 }
      ],
      financements: [
        { id: 'fin-a1', financeur: 'Subvention sollicitée (Istitmar TPE)', montant: 65000, statut: 'sollicite' },
        { id: 'fin-a2', financeur: 'Apport personnel artisan', montant: 30000, statut: 'acquis' }
      ]
    },
    dossier: {
      dossier_id: 'DOS-2026-ARTISAN-9904',
      date_soumission: '2026-09-06T16:45:00.000Z',
      statut: 'en_attente',
      pieces_requises: ['piece_identite', 'rib', 'devis', 'justificatif_activite'],
      remarques_instructeur: 'Dossier déposé et enregistré. En attente de passage devant la commission de recevabilité.',
      pieces: [
        {
          nom_fichier: 'CNIE_Rachid_El_Idrissi.pdf',
          type_declare: 'piece_identite',
          type_suggere_ocr: 'piece_identite',
          texte_ocr: 'ROYAUME DU MAROC CARTE NATIONALE CIN PB112233 Rachid El Idrissi',
          champs_detectes: {},
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        },
        {
          nom_fichier: 'RIB_Credit_Agricole_Rachid.pdf',
          type_declare: 'rib',
          type_suggere_ocr: 'rib',
          texte_ocr: 'CREDIT AGRICOLE DU MAROC RIB IBAN MA64 0225 9000 1234 5678 9012 34',
          champs_detectes: { iban: 'MA64 0225 9000 1234 5678 9012 34' },
          fichier_base64: 'data:application/pdf;base64,JVBERi0xLjQKJcfs...',
          statut_ocr: 'succes'
        }
      ]
    }
  }
];
