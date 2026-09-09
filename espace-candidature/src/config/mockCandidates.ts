import { v4 as uuidv4 } from 'uuid';
import type { DemandeurFormData, ProjetFormData, BudgetFormData } from '../types/form';

export interface SyntheticDocData {
  rib: {
    banque: string;
    titulaire: string;
    ice: string;
    iban: string;
    bic: string;
    ville: string;
  };
  devis: {
    fournisseur: string;
    iceFournisseur: string;
    totalHT: number;
    tva: number;
    totalTTC: number;
    designation: string;
  };
  cnss: {
    numAffiliation: string;
    cotisations: string;
  };
}

export interface MockCandidate {
  id: string;
  nomCourt: string;
  badge: string;
  tagline: string;
  demandeur: DemandeurFormData;
  projet: ProjetFormData;
  budget: BudgetFormData;
  syntheticDocs: SyntheticDocData;
}

// 10 Premiers Candidats Référents Façonnés à la Main
const CORE_10_CANDIDATES: MockCandidate[] = [
  // 1. ATLAS TECH SOLUTIONS SARL (Casablanca)
  {
    id: 'cand-1',
    nomCourt: 'ATLAS TECH SOLUTIONS',
    badge: 'Digital & IA',
    tagline: 'Leader des solutions d\'infrastructure Cloud et Intelligence Artificielle au Maroc',
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
      email_representant: 'contact@atlastech-solutions.ma',
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
        { id: uuidv4(), libelle: 'Serveurs de calcul Cloud & GPU Hardware (selon Devis Fournisseur)', montant: 288000 },
        { id: uuidv4(), libelle: 'Installation réseau haute disponibilité & baie rack', montant: 72000 },
        { id: uuidv4(), libelle: 'Déploiement logiciel IA & cybersécurité Linux', montant: 60000 },
        { id: uuidv4(), libelle: 'Formation technique des ingénieurs & accompagnement', montant: 60000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (TATWIR R&D et Innovation)', montant: 288000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Apport propre ATLAS TECH SOLUTIONS SARL', montant: 112000, statut: 'acquis' },
        { id: uuidv4(), financeur: 'Financement bancaire d\'investissement (Attijariwafa Bank)', montant: 80000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'ATTIJARIWAFA BANK (Agence Casablanca Anfa)',
        titulaire: 'ATLAS TECH SOLUTIONS SARL',
        ice: '002345678000045',
        iban: 'MA64 0077 8000 0123 4567 8901 42',
        bic: 'BCMAMAMC',
        ville: 'Casablanca'
      },
      devis: {
        fournisseur: 'NORTH AFRICA CLOUD & HARDWARE SARL',
        iceFournisseur: '001987654000088',
        totalHT: 240000,
        tva: 48000,
        totalTTC: 288000,
        designation: 'Serveurs de calcul Cloud & GPU Hardware IA (Deep Learning)'
      },
      cnss: {
        numAffiliation: '8492019',
        cotisations: '45 000,00 DH'
      }
    }
  },

  // 2. Coopérative Féminine Argania Bio (Agadir)
  {
    id: 'cand-2',
    nomCourt: 'Coopérative Argania Bio',
    badge: 'Économie Solidaire',
    tagline: 'Valorisation solidaire de l\'huile d\'argan et inclusion économique des femmes rurales',
    demandeur: {
      structure_type: 'autre',
      nom_ou_raison_sociale: 'Coopérative Féminine Agricole Argania Bio',
      siret: '001892340000012',
      secteur_activite: 'Agroalimentaire biologique & Cosmétique du terroir',
      adresse: 'Douar Tizourgane, Commune Rurale Aït Baha',
      code_postal: '80000',
      ville: 'Agadir',
      region: 'Souss-Massa',
      anciennete_annees: 6,
      nom_representant: 'AIT TALEB',
      prenom_representant: 'Fatima Zohra',
      date_naissance_representant: '1982-08-20',
      cin_representant: 'JH234561',
      email_representant: 'argania.coop@gmail.com',
      telephone_representant: '0663456789'
    },
    projet: {
      objet_projet: 'Modernisation de l\'Unité d\'Extraction et Certification Éco-Bio',
      description: 'Acquisition de deux pressoirs mécaniques en inox alimentaire, d\'une ligne de filtrage et mise en place de la traçabilité digitale pour 45 femmes artisanes membres de la coopérative.',
      date_debut: '2026-11-01',
      date_fin: '2027-10-31',
      programme_id: 'prog-indh-inclusion'
    },
    budget: {
      montant_total: 250000,
      montant_demande: 180000,
      depenses: [
        { id: uuidv4(), libelle: 'Ligne d\'extraction inox & pressoirs mécanisés (Devis Fournisseur)', montant: 140000 },
        { id: uuidv4(), libelle: 'Travaux d\'hygiène et mise aux normes ONSSA', montant: 60000 },
        { id: uuidv4(), libelle: 'Formation hygiène, étiquetage & vente e-commerce', montant: 50000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (Fonds INDH Souss-Massa)', montant: 180000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Apport coopérative & cotisations adhérentes', montant: 70000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'BANQUE CENTRALE POPULAIRE (Succursale Hassan II Agadir)',
        titulaire: 'COOPERATIVE FEMININE AGRICOLE ARGANIA BIO',
        ice: '001892340000012',
        iban: 'MA64 1017 8000 0054 3210 9876 54',
        bic: 'BPOUMAMC',
        ville: 'Agadir'
      },
      devis: {
        fournisseur: 'AGROMAC MAROC SARL',
        iceFournisseur: '001765432000011',
        totalHT: 116666.67,
        tva: 23333.33,
        totalTTC: 140000,
        designation: '2 Pressoirs à froid inox 316L & groupe filtrant 500L/h'
      },
      cnss: {
        numAffiliation: '6741289',
        cotisations: '18 500,00 DH'
      }
    }
  },

  // 3. Maroc Smart Irrigation & Agri-Tech SAS (Meknès)
  {
    id: 'cand-3',
    nomCourt: 'Maroc Smart Irrigation',
    badge: 'AgriTech & Eau',
    tagline: 'Économie d\'eau intelligente par sondes tensiométriques et automatisation solaire',
    demandeur: {
      structure_type: 'entreprise',
      nom_ou_raison_sociale: 'Maroc Smart Irrigation & Agri-Tech SAS',
      siret: '002456789000078',
      secteur_activite: 'Technologies agricoles, IoT & Gestion durable de l\'eau',
      adresse: 'Parc Agropolis de Meknès, Lot 45',
      code_postal: '50000',
      ville: 'Meknès',
      region: 'Fès-Meknès',
      anciennete_annees: 3,
      nom_representant: 'BENJELLOUN',
      prenom_representant: 'Mehdi',
      date_naissance_representant: '1990-11-05',
      cin_representant: 'CD567890',
      email_representant: 'm.benjelloun@smart-irrigation.ma',
      telephone_representant: '0661987654'
    },
    projet: {
      objet_projet: 'Réseau IoT d\'Irrigation de Précision et Sondes Connectées',
      description: 'Déploiement d\'un réseau de vannes connectées LoRaWAN et sondes capacitives permettant d\'économiser 40% d\'eau d\'irrigation dans la plaine du Saïss.',
      date_debut: '2026-10-15',
      date_fin: '2027-10-14',
      programme_id: 'prog-green-invest'
    },
    budget: {
      montant_total: 700000,
      montant_demande: 420000,
      depenses: [
        { id: uuidv4(), libelle: 'Électrovannes IoT, sondes capacitives & passerelles LoRa (Devis Fournisseur)', montant: 350000 },
        { id: uuidv4(), libelle: 'Kit d\'alimentation solaire & batteries lithium de secours', montant: 180000 },
        { id: uuidv4(), libelle: 'Développement de l\'application mobile météo/arrosage', montant: 170000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (Green Invest - Co-financement Vert)', montant: 420000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Fonds d\'Amorçage AgriTech & Apport des fondateurs', montant: 280000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'CREDIT AGRICOLE DU MAROC (Agence Principale Meknès)',
        titulaire: 'MAROC SMART IRRIGATION & AGRI-TECH SAS',
        ice: '002456789000078',
        iban: 'MA64 2257 8000 0012 3456 7890 33',
        bic: 'CAMAMAMC',
        ville: 'Meknès'
      },
      devis: {
        fournisseur: 'MAGHREB IOT SOLUTIONS SARL',
        iceFournisseur: '002019283000095',
        totalHT: 291666.67,
        tva: 58333.33,
        totalTTC: 350000,
        designation: 'Lot de 100 vannes automatiques connectées et 5 passerelles LoRaWAN'
      },
      cnss: {
        numAffiliation: '9128304',
        cotisations: '32 400,00 DH'
      }
    }
  },

  // 4. Association Maroc Santé Pour Tous (Rabat)
  {
    id: 'cand-4',
    nomCourt: 'Maroc Santé Pour Tous',
    badge: 'Santé Communautaire',
    tagline: 'Accès équitable aux soins et télémédecine pour les populations isolées',
    demandeur: {
      structure_type: 'association',
      nom_ou_raison_sociale: 'Association Maroc Santé Pour Tous',
      siret: '001567890000034',
      secteur_activite: 'Santé publique, Prévention & Action médico-sociale',
      adresse: 'Avenue Ibn Sina, Quartier Souissi',
      code_postal: '10000',
      ville: 'Rabat',
      region: 'Rabat-Salé-Kénitra',
      anciennete_annees: 8,
      nom_representant: 'CHRAIBI',
      prenom_representant: 'Amina',
      date_naissance_representant: '1975-03-12',
      cin_representant: 'A345678',
      email_representant: 'contact@marocsante.org.ma',
      telephone_representant: '0661122334'
    },
    projet: {
      objet_projet: 'Unité Mobile de Dépistage & Télé-consultation Médicale',
      description: 'Acquisition et équipement d\'un véhicule médicalisé avec échographe portable, ECG connecté et kit d\'analyses sanguines rapides pour 12 communes rurales.',
      date_debut: '2026-11-01',
      date_fin: '2027-10-31',
      programme_id: 'prog-indh-inclusion'
    },
    budget: {
      montant_total: 500000,
      montant_demande: 300000,
      depenses: [
        { id: uuidv4(), libelle: 'Équipements médicaux portables & télémédecine (Devis Fournisseur)', montant: 220000 },
        { id: uuidv4(), libelle: 'Aménagement intérieur véhicule et générateur solaire', montant: 180000 },
        { id: uuidv4(), libelle: 'Indemnités des médecins bénévoles et logistique', montant: 100000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (INDH Rabat)', montant: 300000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Dons mécénat et fonds propres association', montant: 200000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'BANK OF AFRICA (BMCE Group - Agence Agdal Rabat)',
        titulaire: 'ASSOCIATION MAROC SANTE POUR TOUS',
        ice: '001567890000034',
        iban: 'MA64 0117 8000 0033 4455 6677 88',
        bic: 'BMCEMAMC',
        ville: 'Rabat'
      },
      devis: {
        fournisseur: 'MEDICALL TECHNOLOGIES MAROC',
        iceFournisseur: '001889977000042',
        totalHT: 183333.33,
        tva: 36666.67,
        totalTTC: 220000,
        designation: 'Échographe Doppler portable multi-sondes + Moniteur ECG multiparamétrique'
      },
      cnss: {
        numAffiliation: '5566778',
        cotisations: '24 800,00 DH'
      }
    }
  },

  // 5. BioÉnergie & Recyclage Atlas SARL AU (Marrakech)
  {
    id: 'cand-5',
    nomCourt: 'BioÉnergie Atlas',
    badge: 'Économie Verte',
    tagline: 'Transformation des biodéchets maraîchers et d\'hôtellerie en biogaz et compost',
    demandeur: {
      structure_type: 'entreprise',
      nom_ou_raison_sociale: 'BioÉnergie & Recyclage Atlas SARL AU',
      siret: '002987123000099',
      secteur_activite: 'Économie circulaire, Recyclage & Énergies renouvelables',
      adresse: 'Zone Industrielle Sidi Ghanem, Rue 21',
      code_postal: '40000',
      ville: 'Marrakech',
      region: 'Marrakech-Safi',
      anciennete_annees: 5,
      nom_representant: 'TAZI',
      prenom_representant: 'Karim',
      date_naissance_representant: '1985-09-18',
      cin_representant: 'EE456789',
      email_representant: 'k.tazi@atlas-bioenergie.ma',
      telephone_representant: '0662345678'
    },
    projet: {
      objet_projet: 'Unité Modulaire de Biométhanisation et Compostage Urbain',
      description: 'Installation d\'un méthaniseur continu capable de convertir 15 tonnes/jour de résidus organiques d\'hôtellerie en électricité verte et fertilisant organique certifié.',
      date_debut: '2026-10-01',
      date_fin: '2027-09-30',
      programme_id: 'prog-tatwir-vert'
    },
    budget: {
      montant_total: 850000,
      montant_demande: 500000,
      depenses: [
        { id: uuidv4(), libelle: 'Digesteur anaérobie modulaire & groupe cogénération (Devis Fournisseur)', montant: 480000 },
        { id: uuidv4(), libelle: 'Broyeurs industriels & système de déshydratation', montant: 220000 },
        { id: uuidv4(), libelle: 'Certification biologique laboratoire & analyse gaz', montant: 150000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (TATWIR Croissance Verte)', montant: 500000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Crédit Vert bancaire & apport actionnaire', montant: 350000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'SOCIETE GENERALE MAROC (Agence Guéliz Marrakech)',
        titulaire: 'BIOENERGIE & RECYCLAGE ATLAS SARL AU',
        ice: '002987123000099',
        iban: 'MA64 0227 8000 0099 8877 6655 11',
        bic: 'SGMBMAMC',
        ville: 'Marrakech'
      },
      devis: {
        fournisseur: 'GREEN TECH ENGINEERING MAROC',
        iceFournisseur: '001654321000077',
        totalHT: 400000,
        tva: 80000,
        totalTTC: 480000,
        designation: 'Unité compacte de digestion anaérobie 25m3 et groupe électrogène biogaz 35 kVA'
      },
      cnss: {
        numAffiliation: '7788990',
        cotisations: '41 200,00 DH'
      }
    }
  },

  // 6. Atelier d'Artisanat Zellige Fassi (Fès)
  {
    id: 'cand-6',
    nomCourt: 'Atelier Zellige Fassi',
    badge: 'Artisanat & Art',
    tagline: 'Perpétuation du Zellige marocain millénaire et modernisation thermique des ateliers',
    demandeur: {
      structure_type: 'independant',
      nom_ou_raison_sociale: 'Atelier Maalem Omar El Fassi - Zellige & Céramique',
      siret: '001234987000056',
      secteur_activite: 'Artisanat d\'art, Céramique traditionnelle & Zellige',
      adresse: 'Quartier des Potiers, Rue Ain Nokbi',
      code_postal: '30000',
      ville: 'Fès',
      region: 'Fès-Meknès',
      anciennete_annees: 12,
      nom_representant: 'EL FASSI',
      prenom_representant: 'Omar',
      date_naissance_representant: '1970-06-25',
      cin_representant: 'C123987',
      email_representant: 'omar.zellige@gmail.com',
      telephone_representant: '0665432109'
    },
    projet: {
      objet_projet: 'Fours Écologiques Haute Performance et Plateforme E-Export',
      description: 'Remplacement des anciens fours à sciure par deux fours à gaz automatisés zéro fumée et création d\'un catalogue virtuel 3D pour la clientèle internationale.',
      date_debut: '2026-11-15',
      date_fin: '2027-11-14',
      programme_id: 'prog-istitmar-tpe'
    },
    budget: {
      montant_total: 320000,
      montant_demande: 200000,
      depenses: [
        { id: uuidv4(), libelle: 'Fours à gaz de céramique thermostatés zéro émission (Devis Fournisseur)', montant: 180000 },
        { id: uuidv4(), libelle: 'Outillage de précision et postes ergonomiques de taille', montant: 80000 },
        { id: uuidv4(), libelle: 'Numérisation du catalogue et boutique export en ligne', montant: 60000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (Istitmar TPE - Prime d\'Investissement)', montant: 200000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Chambre d\'Artisanat Fès & Épargne personnelle', montant: 120000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'CIH BANK (Agence Fès Médina)',
        titulaire: 'ATELIER MAALEM OMAR EL FASSI',
        ice: '001234987000056',
        iban: 'MA64 2307 8000 0044 5566 7788 99',
        bic: 'CIHMMAMC',
        ville: 'Fès'
      },
      devis: {
        fournisseur: 'FOURS THERMIQUES DU NORD SARL',
        iceFournisseur: '001443322000091',
        totalHT: 150000,
        tva: 30000,
        totalTTC: 180000,
        designation: '2 Fours de céramiste à gaz régulation numérique 1300°C'
      },
      cnss: {
        numAffiliation: '4455661',
        cotisations: '12 800,00 DH'
      }
    }
  },

  // 7. Tangier Logistics & Smart Supply SA (Tanger)
  {
    id: 'cand-7',
    nomCourt: 'Tangier Logistics SA',
    badge: 'Industrie & PME',
    tagline: 'Logistique automatisée et traçabilité temps réel pour les corridors Tanger Med',
    demandeur: {
      structure_type: 'entreprise',
      nom_ou_raison_sociale: 'Tangier Logistics & Smart Supply SA',
      siret: '002123789000065',
      secteur_activite: 'Logistique avancée, Transport international & Supply Chain',
      adresse: 'Tanger Automotive City, Plateforme Industrielle Îlot 12',
      code_postal: '90000',
      ville: 'Tanger',
      region: 'Tanger-Tétouan-Al Hoceïma',
      anciennete_annees: 7,
      nom_representant: 'KABBAJ',
      prenom_representant: 'Hicham',
      date_naissance_representant: '1980-01-30',
      cin_representant: 'KB654321',
      email_representant: 'h.kabbaj@tangier-logistics.ma',
      telephone_representant: '0661778899'
    },
    projet: {
      objet_projet: 'Système RFID & Vision IA de Traçabilité des Conteneurs Portuaires',
      description: 'Déploiement de portiques RFID intelligents et de caméras à reconnaissance de caractères automatisée aux barrières d\'accès logistiques de la zone franche.',
      date_debut: '2026-10-01',
      date_fin: '2027-09-30',
      programme_id: 'prog-istitmar-pme'
    },
    budget: {
      montant_total: 1100000,
      montant_demande: 650000,
      depenses: [
        { id: uuidv4(), libelle: 'Portiques RFID industriels & caméras IA haute vitesse (Devis Fournisseur)', montant: 520000 },
        { id: uuidv4(), libelle: 'Développement connecteur ERP / Portnet douanier', montant: 300000 },
        { id: uuidv4(), libelle: 'Serveurs passerelle edge computing & réseau fibre optique', montant: 280000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (Istitmar PME - Prime Industrielle)', montant: 650000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Fonds propres Tangier Logistics & emprunt bancaire', montant: 450000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'ATTIJARIWAFA BANK (Agence Tanger Boulevard Mohamed V)',
        titulaire: 'TANGIER LOGISTICS & SMART SUPPLY SA',
        ice: '002123789000065',
        iban: 'MA64 0077 8000 0088 7766 5544 33',
        bic: 'BCMAMAMC',
        ville: 'Tanger'
      },
      devis: {
        fournisseur: 'AUTOMATION & SENSORS MED SARL',
        iceFournisseur: '001998877000055',
        totalHT: 433333.33,
        tva: 86666.67,
        totalTTC: 520000,
        designation: '4 Portiques RFID industriels ultra-haute fréquence et 16 caméras OCR matricielles'
      },
      cnss: {
        numAffiliation: '9988112',
        cotisations: '68 400,00 DH'
      }
    }
  },

  // 8. Studio 3D & Prototypage Rapide du Rif (Al Hoceïma) - Programme FORSA 2025
  {
    id: 'cand-8',
    nomCourt: 'Studio 3D Rif (FORSA)',
    badge: 'Programme FORSA',
    tagline: 'Studio de design 3D et prototypage rapide financé par le programme national FORSA',
    demandeur: {
      structure_type: 'independant',
      nom_ou_raison_sociale: 'Studio 3D & Prototypage Rapide du Rif',
      siret: '001789456000023',
      secteur_activite: 'Design 3D, Prototypage rapide & Création numérique',
      adresse: 'Boulevard Tarik Ibn Ziad, Espace Coworking',
      code_postal: '32000',
      ville: 'Al Hoceïma',
      region: 'Tanger-Tétouan-Al Hoceïma',
      anciennete_annees: 1,
      nom_representant: 'BENALI',
      prenom_representant: 'Yassine',
      date_naissance_representant: '1996-09-12',
      cin_representant: 'RH123456',
      email_representant: 'yassine.benali@studio3d-rif.ma',
      telephone_representant: '0661998877'
    },
    projet: {
      objet_projet: 'Équipement d\'un Studio de Prototypage et Modélisation 3D (FORSA 2025)',
      description: 'Acquisition d\'imprimantes 3D résine et FDM, scanner 3D laser et stations de modélisation CAO dans le cadre du programme national FORSA piloté par la SMIT avec l\'accompagnement de l\'incubateur régional.',
      date_debut: '2026-10-01',
      date_fin: '2027-09-30',
      programme_id: 'prog-forsa'
    },
    budget: {
      montant_total: 100000,
      montant_demande: 100000,
      depenses: [
        { id: uuidv4(), libelle: 'Pack 3 imprimantes 3D professionnelles & scanner laser (Devis Fournisseur)', montant: 72000 },
        { id: uuidv4(), libelle: 'Poste de travail informatique CAO & licence logicielle 3D', montant: 18000 },
        { id: uuidv4(), libelle: 'Fonds de roulement initial & matières premières (Filaments/Résines)', montant: 10000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Prêt d\'honneur FORSA à taux 0% (remboursable sur 10 ans)', montant: 90000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Subvention d\'amorçage FORSA (non remboursable)', montant: 10000, statut: 'sollicite' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'BANQUE CENTRALE POPULAIRE (Agence Al Hoceïma Centre)',
        titulaire: 'STUDIO 3D ET PROTOTYPAGE RAPIDE DU RIF',
        ice: '001789456000023',
        iban: 'MA64 1017 8000 0066 7788 9900 12',
        bic: 'BPOUMAMC',
        ville: 'Al Hoceïma'
      },
      devis: {
        fournisseur: 'NORTH FABLAB EQUIPMENT SARL',
        iceFournisseur: '001334455000028',
        totalHT: 60000,
        tva: 12000,
        totalTTC: 72000,
        designation: 'Pack 3 imprimantes 3D professionnelles et scanner 3D optique haute résolution'
      },
      cnss: {
        numAffiliation: '3344552',
        cotisations: '4 200,00 DH'
      }
    }
  },

  // 9. Sahara Green Hydrogen & Solar Tech SARL (Ouarzazate)
  {
    id: 'cand-9',
    nomCourt: 'Sahara Green Hydrogen',
    badge: 'Énergie & R&D',
    tagline: 'Électrolyseurs solaires décentralisés pour la production d\'hydrogène vert dans le Sud marocain',
    demandeur: {
      structure_type: 'entreprise',
      nom_ou_raison_sociale: 'Sahara Green Hydrogen & Solar Tech SARL',
      siret: '002678123000044',
      secteur_activite: 'Énergies renouvelables, Solaire thermodynamique & Hydrogène',
      adresse: 'Parc Industriel Solaire Noor Ouarzazate',
      code_postal: '45000',
      ville: 'Ouarzazate',
      region: 'Drâa-Tafilalet',
      anciennete_annees: 2,
      nom_representant: 'NACIRI',
      prenom_representant: 'Tariq',
      date_naissance_representant: '1987-07-14',
      cin_representant: 'PB345612',
      email_representant: 't.naciri@sahara-hydrogen.ma',
      telephone_representant: '0661554433'
    },
    projet: {
      objet_projet: 'Banc d\'Essai Électrolyseur PEM Couplé Solaire Photovoltaïque',
      description: 'Mise au point d\'un prototype d\'électrolyseur à membrane échangeuse de protons (PEM) résistant aux fortes chaleurs désertiques pour la micro-génération d\'énergie.',
      date_debut: '2026-11-01',
      date_fin: '2027-10-31',
      programme_id: 'prog-tatwir-rd'
    },
    budget: {
      montant_total: 980000,
      montant_demande: 600000,
      depenses: [
        { id: uuidv4(), libelle: 'Cellules d\'électrolyse PEM & compresseur hydrogène haute pression (Devis Fournisseur)', montant: 580000 },
        { id: uuidv4(), libelle: 'Onduleurs solaires DC/DC & capteurs thermodynamiques', montant: 240000 },
        { id: uuidv4(), libelle: 'Ingénieurs chimistes et essais de sécurité en laboratoire', montant: 160000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (Tatwir R&D / Maroc PME)', montant: 600000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Fonds d\'investissement Climat & capitaux propres', montant: 380000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'BANK OF AFRICA (Agence Ouarzazate Avenue Mohammed V)',
        titulaire: 'SAHARA GREEN HYDROGEN & SOLAR TECH SARL',
        ice: '002678123000044',
        iban: 'MA64 0117 8000 0055 6677 8899 44',
        bic: 'BMCEMAMC',
        ville: 'Ouarzazate'
      },
      devis: {
        fournisseur: 'HYDROGEN LABS INTERNATIONAL MAROC',
        iceFournisseur: '001556677000088',
        totalHT: 483333.33,
        tva: 96666.67,
        totalTTC: 580000,
        designation: 'Stack électrolyseur PEM 20 kW avec système de désionisation et sécurité gaz'
      },
      cnss: {
        numAffiliation: '8899001',
        cotisations: '29 500,00 DH'
      }
    }
  },

  // 10. Centre Médical & Télémédecine de l'Atlas (Béni Mellal)
  {
    id: 'cand-10',
    nomCourt: 'Télémédecine de l\'Atlas',
    badge: 'Santé Publique',
    tagline: 'Désenclavement sanitaire des zones de montagne du Haut Atlas par la télé-expertise médicale',
    demandeur: {
      structure_type: 'etablissement_public',
      nom_ou_raison_sociale: 'Groupement Sanitaire & Télémédecine du Moyen Atlas',
      siret: '001345678000088',
      secteur_activite: 'Santé publique, Télémédecine & Soins primaires',
      adresse: 'Boulevard Hassan II, Centre Hospitalier Régional',
      code_postal: '23000',
      ville: 'Béni Mellal',
      region: 'Béni Mellal-Khénifra',
      anciennete_annees: 10,
      nom_representant: 'KADMIRI',
      prenom_representant: 'Nadia',
      date_naissance_representant: '1979-05-03',
      cin_representant: 'I456789',
      email_representant: 'dr.kadmiri@sante-atlas.ma',
      telephone_representant: '0662113355'
    },
    projet: {
      objet_projet: 'Plateforme Régionale de Télé-expertise Médicale Haut Atlas',
      description: 'Équipement de 20 centres de santé ruraux en stations de télémédecine connectées pour permettre aux médecins spécialistes de Béni Mellal de télé-consulter les patients des zones isolées.',
      date_debut: '2026-10-01',
      date_fin: '2027-09-30',
      programme_id: 'prog-indh-inclusion'
    },
    budget: {
      montant_total: 620000,
      montant_demande: 380000,
      depenses: [
        { id: uuidv4(), libelle: '20 Chariots mobiles de télémédecine et caméras haute définition (Devis Fournisseur)', montant: 320000 },
        { id: uuidv4(), libelle: 'Liaisons 4G/Satellite sécurisées & conformité CNDP', montant: 180000 },
        { id: uuidv4(), libelle: 'Formation continue des infirmiers de dispensaires ruraux', montant: 120000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée (INDH Béni Mellal-Khénifra)', montant: 380000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Budget Conseil Régional Béni Mellal & partenaires', montant: 240000, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: 'TRESORERIE GENERALE DU ROYAUME (TGR Béni Mellal)',
        titulaire: 'GROUPEMENT SANITAIRE TELEMEDECINE MOYEN ATLAS',
        ice: '001345678000088',
        iban: 'MA64 3107 8000 0011 2233 4455 66',
        bic: 'TGRMMAMC',
        ville: 'Béni Mellal'
      },
      devis: {
        fournisseur: 'TELEHEALTH MOROCCO SOLUTIONS SARL',
        iceFournisseur: '001990011000033',
        totalHT: 266666.67,
        tva: 53333.33,
        totalTTC: 320000,
        designation: '20 Stations compactes de télémédecine avec stéthoscope et dermatoscope numériques'
      },
      cnss: {
        numAffiliation: '6677884',
        cotisations: '58 000,00 DH'
      }
    }
  }
];

// Seed pools marocains pour générer avec rigueur et variété les 90 candidats suivants (11 à 100)
interface RegionCity {
  ville: string;
  cp: string;
  region: string;
  cinPrefix: string;
  banqueLocale: string;
  codeBanque: string;
}

const REGION_CITIES: RegionCity[] = [
  { ville: 'Casablanca', cp: '20000', region: 'Casablanca-Settat', cinPrefix: 'BE', banqueLocale: 'Attijariwafa Bank Anfa', codeBanque: '007' },
  { ville: 'Rabat', cp: '10000', region: 'Rabat-Salé-Kénitra', cinPrefix: 'A', banqueLocale: 'Bank of Africa Agdal', codeBanque: '011' },
  { ville: 'Tanger', cp: '90000', region: 'Tanger-Tétouan-Al Hoceïma', cinPrefix: 'KB', banqueLocale: 'Banque Populaire Tanger Med', codeBanque: '101' },
  { ville: 'Marrakech', cp: '40000', region: 'Marrakech-Safi', cinPrefix: 'EE', banqueLocale: 'Société Générale Guéliz', codeBanque: '022' },
  { ville: 'Fès', cp: '30000', region: 'Fès-Meknès', cinPrefix: 'C', banqueLocale: 'CIH Bank Médina', codeBanque: '230' },
  { ville: 'Agadir', cp: '80000', region: 'Souss-Massa', cinPrefix: 'JH', banqueLocale: 'Crédit Agricole Souss', codeBanque: '225' },
  { ville: 'Meknès', cp: '50000', region: 'Fès-Meknès', cinPrefix: 'CD', banqueLocale: 'Banque Populaire Hamria', codeBanque: '101' },
  { ville: 'Oujda', cp: '60000', region: 'Oriental', cinPrefix: 'F', banqueLocale: 'Attijariwafa Bank Boulevard Mohammed V', codeBanque: '007' },
  { ville: 'Kénitra', cp: '14000', region: 'Rabat-Salé-Kénitra', cinPrefix: 'G', banqueLocale: 'Bank of Africa Maâmora', codeBanque: '011' },
  { ville: 'Tétouan', cp: '93000', region: 'Tanger-Tétouan-Al Hoceïma', cinPrefix: 'L', banqueLocale: 'Banque Populaire Wilaya', codeBanque: '101' },
  { ville: 'Safi', cp: '46000', region: 'Marrakech-Safi', cinPrefix: 'H', banqueLocale: 'CIH Bank Plateau', codeBanque: '230' },
  { ville: 'El Jadida', cp: '24000', region: 'Casablanca-Settat', cinPrefix: 'M', banqueLocale: 'Attijariwafa Bank Mazagan', codeBanque: '007' },
  { ville: 'Nador', cp: '62000', region: 'Oriental', cinPrefix: 'S', banqueLocale: 'Banque Populaire Marchica', codeBanque: '101' },
  { ville: 'Béni Mellal', cp: '23000', region: 'Béni Mellal-Khénifra', cinPrefix: 'I', banqueLocale: 'Crédit Agricole Atlas', codeBanque: '225' },
  { ville: 'Ouarzazate', cp: '45000', region: 'Drâa-Tafilalet', cinPrefix: 'PB', banqueLocale: 'Société Générale Sud', codeBanque: '022' },
  { ville: 'Laâyoune', cp: '70000', region: 'Laâyoune-Sakia El Hamra', cinPrefix: 'SH', banqueLocale: 'Banque Populaire Laâyoune Port', codeBanque: '101' },
  { ville: 'Dakhla', cp: '73000', region: 'Dakhla-Oued Ed-Dahab', cinPrefix: 'OD', banqueLocale: 'Attijariwafa Bank Oued Ed-Dahab', codeBanque: '007' },
  { ville: 'Guelmim', cp: '81000', region: 'Guelmim-Oued Noun', cinPrefix: 'JA', banqueLocale: 'Bank of Africa Porte du Sahara', codeBanque: '011' }
];

const LAST_NAMES = [
  'EL AMRANI', 'BENJELLOUN', 'CHRAIBI', 'TAZI', 'EL FASSI', 'KABBAJ', 'BENALI', 'NACIRI',
  'BERRADA', 'ALAOUI', 'IDRISSI', 'SEKKAT', 'BOUAZZA', 'AIT OUAHMANE', 'LAHLOU', 'MANSOURI',
  'TOUHAMI', 'ZAHRAOUI', 'AMMOR', 'KETTANI', 'FILALI', 'MEKOUAR', 'BOUKHLIFI', 'SLIMANI',
  'BOUZIANE', 'MOUSTAGHFIR', 'TAHIRI', 'SAADI', 'AZZOUZI', 'DAOUDI'
];

const FIRST_NAMES = [
  'Youssef', 'Mehdi', 'Amina', 'Karim', 'Omar', 'Hicham', 'Salma', 'Tariq',
  'Nadia', 'Fatima Zohra', 'Anas', 'Reda', 'Siham', 'Zineb', 'Hamza', 'Imane',
  'Mohamed', 'Soufiane', 'Khadija', 'Othmane', 'Asmaa', 'Walid', 'Meryem', 'Nabil',
  'Leila', 'Ismail', 'Houda', 'Rachid', 'Sara', 'Adil'
];

interface SectorTemplate {
  badge: string;
  structureType: 'entreprise' | 'association' | 'autre' | 'independant' | 'etablissement_public';
  secteur: string;
  nomPrefixes: string[];
  projetTitre: string;
  projetDesc: string;
  devisFournisseur: string;
  devisDesignation: string;
  progId: string;
  budgetTotal: number;
  budgetDemande: number;
  devisTotal: number;
}

const SECTOR_TEMPLATES: SectorTemplate[] = [
  {
    badge: 'Istitmar TPE',
    structureType: 'entreprise',
    secteur: 'Très Petites Entreprises & Atelier de Production',
    nomPrefixes: ['Menuiserie Moderne', 'Atelier Mécanique Précision', 'Fabrique Textile Atlas', 'Maroc Plastiques TPE'],
    projetTitre: 'Modernisation de l\'Atelier & Acquisition de Machines Numériques',
    projetDesc: 'Acquisition de machines-outils semi-automatisées et modernisation des postes de production pour les TPE à fort potentiel de croissance industrielle.',
    devisFournisseur: 'MAROC OUTILLAGE INDUSTRIEL SARL',
    devisDesignation: 'Pack machines-outils de découpe et façonnage industriel',
    progId: 'prog-istitmar-tpe',
    budgetTotal: 380000,
    budgetDemande: 190000,
    devisTotal: 220000
  },
  {
    badge: 'Croissance Verte',
    structureType: 'entreprise',
    secteur: 'Économie Circulaire, Efficacité Énergétique & Recyclage',
    nomPrefixes: ['EcoPlast Recyclage', 'Green Energy Maghreb', 'BioTraitement Maroc', 'Atlas Déchets Verts'],
    projetTitre: 'Ligne de Recyclage et Valorisation des Matières Résiduelles',
    projetDesc: 'Installation d\'une unité de broyage, lavage et granulation de plastiques industriels avec bilan carbone optimisé et réutilisation en circuit court.',
    devisFournisseur: 'ECO-EQUIPEMENT NORD AFRIQUE',
    devisDesignation: 'Broyeur granulateur inox basse consommation et filtre cyclonique',
    progId: 'prog-tatwir-vert',
    budgetTotal: 850000,
    budgetDemande: 450000,
    devisTotal: 420000
  },
  {
    badge: 'INDH Inclusion',
    structureType: 'autre',
    secteur: 'Valorisation des Produits du Terroir & Bio',
    nomPrefixes: ['Coopérative Bio Safran & Plantes', 'Union Agricole Dattes & Fruits', 'Coopérative Miel & Apiculture de l\'Atlas', 'Coopérative Terroirs Berbères'],
    projetTitre: 'Unité Moderne de Conditionnement et Traçabilité QR Code',
    projetDesc: 'Mise en place d\'une ligne de séchage thermo-régulé, d\'ensachage sous vide et d\'étiquetage sécurisé pour l\'exportation de produits certifiés bio.',
    devisFournisseur: 'AGRI-PACKING MAROC SARL',
    devisDesignation: 'Ligne d\'ensachage semi-automatique inox et étiqueteuse code-barres',
    progId: 'prog-indh-inclusion',
    budgetTotal: 280000,
    budgetDemande: 190000,
    devisTotal: 160000
  },
  {
    badge: 'Mowakaba Conseil',
    structureType: 'entreprise',
    secteur: 'Conseil en Stratégie & Transformation Digitale',
    nomPrefixes: ['Maghreb ERP Consulting', 'Atlas Lean Performance', 'CyberData Advisory', 'QualiTech Maroc Solutions'],
    projetTitre: 'Plan de Transformation Numérique et Excellence Opérationnelle',
    projetDesc: 'Mission d\'expertise technique pour l\'intégration d\'un progiciel ERP intégré, audit cybersécurité et réingénierie des processus industriels.',
    devisFournisseur: 'CABINET CONSEIL DIGIT-AFRIQUE SARL',
    devisDesignation: 'Prestation d\'audit technique, schéma directeur IT et déploiement ERP',
    progId: 'prog-mowakaba',
    budgetTotal: 320000,
    budgetDemande: 190000,
    devisTotal: 170000
  },
  {
    badge: 'Intelak Rural',
    structureType: 'independant',
    secteur: 'Agriculture Durable, Élevage & Terroir Rural',
    nomPrefixes: ['Ferme Oasienne Moderne', 'Domaine Oléicole de l\'Atlas', 'Élevage Caprin & Fromagerie Bio', 'Vergers Fertiles du Gharb'],
    projetTitre: 'Installation de Serres Intelligentes et Irrigation Solaire Rurale',
    projetDesc: 'Création d\'une exploitation agricole moderne en milieu rural combinant panneaux solaires photovoltaïques et système de goutte-à-goutte automatisé.',
    devisFournisseur: 'AGRI-SOLAIRE MAROC EXPANSION',
    devisDesignation: 'Équipement d\'irrigation localisée et générateur solaire de pompage',
    progId: 'prog-intelaka-rural',
    budgetTotal: 400000,
    budgetDemande: 280000,
    devisTotal: 240000
  },
  {
    badge: 'Istitmar PME',
    structureType: 'entreprise',
    secteur: 'Fabrication Industrielle, Métallurgie & Électronique',
    nomPrefixes: ['Atlas Mécanique de Précision', 'Maroc Automatisme SA', 'PlastiTech Industrie SA', 'Euro-Maghreb Électronique'],
    projetTitre: 'Extension de Capacité de Production et Usinage Robotisé',
    projetDesc: 'Acquisition d\'un centre d\'usinage 5 axes à commande numérique et d\'un bras robotisé pour approvisionner les filières aéronautique et automobile.',
    devisFournisseur: 'EQUIPEMENTS INDUSTRIELS INTERNATIONAUX',
    devisDesignation: 'Centre d\'usinage vertical CNC 5 axes et magasin d\'outils automatisé',
    progId: 'prog-istitmar-pme',
    budgetTotal: 1200000,
    budgetDemande: 600000,
    devisTotal: 580000
  },
  {
    badge: 'Green Invest',
    structureType: 'entreprise',
    secteur: 'Énergie Solaire, Pompage & Décarbonation',
    nomPrefixes: ['SunPower Maroc SARL AU', 'Atlas Éco-Énergie SARL', 'HelioTech Maghreb SAS', 'Sahara Solar Pumps SARL'],
    projetTitre: 'Centrale Solaire Photovoltaïque en Autoconsommation Industrielle',
    projetDesc: 'Installation d\'une toiture solaire photovoltaïque de 100 kWc pour réduire de 45% l\'empreinte carbone et la facture électrique d\'un site industriel.',
    devisFournisseur: 'SOLARIS MAROC ENERGY SARL',
    devisDesignation: 'Centrale solaire 100 kWc, onduleurs triphasés et monitoring distant',
    progId: 'prog-green-invest',
    budgetTotal: 650000,
    budgetDemande: 350000,
    devisTotal: 320000
  },
  {
    badge: 'Programme FORSA',
    structureType: 'independant',
    secteur: 'Création de TPE, Services & Commerce de Proximité',
    nomPrefixes: ['Atelier Créatif Digital', 'Coaching & Formation E-learning', 'Pressing Écologique Moderne', 'Studio Design & Communication'],
    projetTitre: 'Lancement d\'Activité & Équipements Clés en Main (FORSA)',
    projetDesc: 'Financement d\'amorçage pour l\'acquisition d\'équipements professionnels, aménagement du local et fonds de roulement initial avec prêt d\'honneur à taux 0%.',
    devisFournisseur: 'MAROC ÉQUIPEMENT BUREAUTIQUE & COMMERCE SARL',
    devisDesignation: 'Pack mobilier d\'atelier, caisse tactile informatisée et postes informatiques',
    progId: 'prog-forsa',
    budgetTotal: 100000,
    budgetDemande: 100000,
    devisTotal: 75000
  },
  {
    badge: 'Start-TPE',
    structureType: 'entreprise',
    secteur: 'Fonds de Roulement & Distribution Commerciale TPE',
    nomPrefixes: ['Comptoir Express Distribution', 'Services Logistiques Express', 'Maghreb Fournitures Pro', 'Atlas Négoce & Services'],
    projetTitre: 'Consolidation du Besoin en Fonds de Roulement (BFR)',
    projetDesc: 'Financement du stock de départ et des créances clients pour sécuriser le démarrage d\'une TPE commerciale ayant validé son crédit d\'investissement.',
    devisFournisseur: 'GROSSISTE CENTRAL DU MAROC SARL',
    devisDesignation: 'Stock de roulement initial certifié et outillage de manutention',
    progId: 'prog-start-tpe',
    budgetTotal: 75000,
    budgetDemande: 50000,
    devisTotal: 45000
  },
  {
    badge: 'Tatwir R&D',
    structureType: 'entreprise',
    secteur: 'Solutions Cloud, Cybersécurité & Intelligence Artificielle',
    nomPrefixes: ['CloudMaroc Systems SARL', 'Maghreb CyberTrust SAS', 'DataSecure Atlas SARL', 'NovaTech Solutions SARL'],
    projetTitre: 'Plateforme Algorithmique IA et Serveurs de Calcul Souverains',
    projetDesc: 'Projet de R&D collaboratif pour concevoir et tester des modèles prédictifs embarqués appliqués à l\'industrie et à la détection des cyber-menaces.',
    devisFournisseur: 'NORTH AFRICA CYBER TECH SARL',
    devisDesignation: 'Cluster 2 serveurs GPU de calcul IA et baies de stockage chiffré',
    progId: 'prog-tatwir-rd',
    budgetTotal: 950000,
    budgetDemande: 550000,
    devisTotal: 480000
  },
  {
    badge: 'Damane Intelak',
    structureType: 'independant',
    secteur: 'Entrepreneuriat des Jeunes & Micro-entreprise',
    nomPrefixes: ['Cabinet Kinésithérapie Moderne', 'Atelier Ébénisterie Design', 'Agence Digitale & Graphisme', 'Optique & Vision Nouvelle'],
    projetTitre: 'Création d\'Entreprise & Équipement Professionnel Garanti',
    projetDesc: 'Financement global d\'investissement sous garantie Damane Intelak pour l\'acquisition des instruments de travail et le premier aménagement professionnel.',
    devisFournisseur: 'MAGHREB MATERIEL PRO SARL',
    devisDesignation: 'Équipements professionnels spécialisés et instrumentation certifiée',
    progId: 'prog-intelaka',
    budgetTotal: 220000,
    budgetDemande: 160000,
    devisTotal: 140000
  }
];

// Génération des 90 candidats complémentaires (pour atteindre 100 au total)
const GENERATED_90_CANDIDATES: MockCandidate[] = Array.from({ length: 90 }, (_, index) => {
  const candIndex = index + 11;
  const rc = REGION_CITIES[index % REGION_CITIES.length];
  const sector = SECTOR_TEMPLATES[index % SECTOR_TEMPLATES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  const firstName = FIRST_NAMES[(index * 3) % FIRST_NAMES.length];

  const iceNumber = `002${(candIndex * 123456789).toString().padStart(11, '0').slice(0, 11)}45`;
  const cinNumber = `${rc.cinPrefix}${((candIndex * 9871) % 899999 + 100000).toString()}`;
  const birthYear = 1970 + (index % 30);
  const birthMonth = ((index % 12) + 1).toString().padStart(2, '0');
  const birthDay = ((index % 28) + 1).toString().padStart(2, '0');
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

  const nomSociete = `${sector.nomPrefixes[index % sector.nomPrefixes.length]} ${rc.ville}`;
  const emailRep = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}@${nomSociete.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}.ma`;
  const telRep = `066${((candIndex * 87654) % 8999999 + 1000000).toString().slice(0, 7)}`;
  const iban = `MA64 ${rc.codeBanque}7 8000 ${candIndex.toString().padStart(4, '0')} ${candIndex.toString().padStart(4, '0')} ${candIndex.toString().padStart(4, '0')} 42`;

  return {
    id: `cand-${candIndex}`,
    nomCourt: nomSociete.length > 26 ? nomSociete.slice(0, 26) + '...' : nomSociete,
    badge: sector.badge,
    tagline: sector.projetTitre,
    demandeur: {
      structure_type: sector.structureType,
      nom_ou_raison_sociale: nomSociete,
      siret: iceNumber,
      secteur_activite: sector.secteur,
      adresse: `Zone d'Activité Économique, Lot ${((candIndex * 7) % 150) + 1}, Rue Principale`,
      code_postal: rc.cp,
      ville: rc.ville,
      region: rc.region,
      anciennete_annees: (index % 10) + 2,
      nom_representant: lastName,
      prenom_representant: firstName,
      date_naissance_representant: birthDate,
      cin_representant: cinNumber,
      email_representant: emailRep,
      telephone_representant: telRep
    },
    projet: {
      objet_projet: sector.projetTitre,
      description: sector.projetDesc,
      date_debut: '2026-10-01',
      date_fin: '2027-09-30',
      programme_id: sector.progId
    },
    budget: {
      montant_total: sector.budgetTotal,
      montant_demande: sector.budgetDemande,
      depenses: [
        { id: uuidv4(), libelle: `${sector.devisDesignation} (selon Devis Fournisseur)`, montant: sector.devisTotal },
        { id: uuidv4(), libelle: 'Travaux d\'aménagement & installation électrique sécurisée', montant: Math.round((sector.budgetTotal - sector.devisTotal) * 0.6) },
        { id: uuidv4(), libelle: 'Formation opérationnelle & transfert de savoir-faire', montant: Math.round((sector.budgetTotal - sector.devisTotal) * 0.4) }
      ],
      financements: [
        { id: uuidv4(), financeur: `Subvention sollicitée (${sector.progId})`, montant: sector.budgetDemande, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Apport propre et fonds de roulement', montant: sector.budgetTotal - sector.budgetDemande, statut: 'acquis' }
      ]
    },
    syntheticDocs: {
      rib: {
        banque: rc.banqueLocale,
        titulaire: nomSociete,
        ice: iceNumber,
        iban: iban,
        bic: 'BCMAMAMC',
        ville: rc.ville
      },
      devis: {
        fournisseur: sector.devisFournisseur,
        iceFournisseur: `001${((candIndex * 312345) % 8999999999 + 1000000000).toString().slice(0, 11)}88`,
        totalHT: Math.round((sector.devisTotal / 1.2) * 100) / 100,
        tva: Math.round((sector.devisTotal - sector.devisTotal / 1.2) * 100) / 100,
        totalTTC: sector.devisTotal,
        designation: sector.devisDesignation
      },
      cnss: {
        numAffiliation: ((candIndex * 654321) % 8999999 + 1000000).toString(),
        cotisations: `${((candIndex * 2450) % 65000 + 15000).toLocaleString('fr-FR')},00 DH`
      }
    }
  };
});

// Les 100 candidats réunis
export const MOCK_CANDIDATES: MockCandidate[] = [
  ...CORE_10_CANDIDATES,
  ...GENERATED_90_CANDIDATES
];
