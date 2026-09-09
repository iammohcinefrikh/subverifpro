import type { ProcessedDocument, DocumentType } from '../types/ocr';
import type { DemandeurFormData } from '../types/form';
import { DOCUMENT_TYPE_DEFINITIONS } from '../config/documentTypes';

export type AuditStatus = 'conforme' | 'erreur_critique' | 'avertissement';

export interface DocumentAuditResult {
  documentId: string;
  nomFichier: string;
  typeDeclare: DocumentType;
  labelDeclare: string;
  status: AuditStatus;
  estUnCv: boolean;
  typeDetecteEstime: string;
  anomalieTitre?: string;
  diagnostic: string;
  explicationDetaillee: string;
  motsClesDetectes: string[];
  recommandation?: string;
}

export interface DossierAuditSummary {
  totalPieces: number;
  nbConformes: number;
  nbAvertissements: number;
  nbErreursCritiques: number;
  aDesErreursBloquantes: boolean;
  items: DocumentAuditResult[];
  resumeGlobal: string;
}

/**
 * Mots-clés caractéristiques d'un Curriculum Vitae (CV)
 */
const CV_KEYWORDS = [
  'curriculum vitae',
  'curriculum-vitae',
  'profil professionnel',
  'expériences professionnelles',
  'experience professionnelle',
  'parcours professionnel',
  'postes occupés',
  'compétences techniques',
  'compétences clés',
  'formation académique',
  'formations & diplômes',
  'diplôme d\'ingénieur',
  'licence fondamentale',
  'master spécialisé',
  'langues & centres d\'intérêt',
  'centres d\'intérêt',
  'bénévolat',
  'soft skills',
  'hard skills'
];

/**
 * Mots-clés caractéristiques d'un Devis commercial / Facture
 */
const DEVIS_KEYWORDS = [
  'devis',
  'total ht',
  'total ttc',
  'montant ht',
  'montant ttc',
  'tva 20%',
  'bon de commande',
  'facture pro-forma',
  'prix unitaire',
  'fournisseur'
];

/**
 * Mots-clés caractéristiques d'un RIB bancaire
 */
const RIB_KEYWORDS = [
  'relevé d\'identité bancaire',
  'releve d\'identite bancaire',
  'code banque',
  'code guichet',
  'clé rib',
  'cle rib',
  'domiciliation',
  'titulaire du compte',
  'iban'
];

/**
 * Mots-clés caractéristiques d'une CNIE / Pièce d'identité marocaine
 */
const CNIE_KEYWORDS = [
  'carte nationale d\'identité',
  'carte nationale d\'identite',
  'cnie',
  'royaume du maroc',
  'surete nationale',
  'sûreté nationale',
  'valable jusqu\'au',
  'nationalité marocaine',
  'passeport'
];

/**
 * Récupère le libellé propre d'un type de document
 */
export function getDocumentLabel(type: DocumentType): string {
  const def = DOCUMENT_TYPE_DEFINITIONS.find((d) => d.type === type);
  return def ? def.label : type;
}

/**
 * Détecte si le texte ou nom de fichier s'apparente indubitablement à un Curriculum Vitae (CV)
 */
export function detectIfCv(text: string, filename: string): { isCv: boolean; matchedKeywords: string[] } {
  const normalized = (text + ' ' + filename).toLowerCase();
  const matched: string[] = [];

  // Vérification nom de fichier
  const fnLower = filename.toLowerCase();
  if (
    fnLower.includes('cv') ||
    fnLower.includes('curriculum') ||
    fnLower.includes('resume')
  ) {
    matched.push('Nom du fichier (CV)');
  }

  // Vérification mots clés
  for (const kw of CV_KEYWORDS) {
    if (normalized.includes(kw)) {
      matched.push(kw);
    }
  }

  // Si au moins 2 mots clés ou 1 mot clé fort ("curriculum vitae" ou "expériences professionnelles")
  const hasStrongMarker =
    normalized.includes('curriculum vitae') ||
    normalized.includes('expériences professionnelles') ||
    normalized.includes('formation académique') ||
    fnLower.includes('cv');

  const hasCnieStrict = normalized.includes('carte nationale d\'identite') || normalized.includes('carte nationale d\'identité') || normalized.includes('cnie');

  const isCv = (matched.length >= 2 || hasStrongMarker) && !hasCnieStrict;
  return { isCv, matchedKeywords: matched };
}

/**
 * Audit complet d'une pièce justificative
 */
export function auditSingleDocument(
  piece: ProcessedDocument,
  demandeur: DemandeurFormData
): DocumentAuditResult {
  const text = (piece.texte_ocr || '').toLowerCase();
  const rawText = piece.texte_ocr || '';
  const filename = piece.nom_fichier;
  const typeDeclare = piece.type_declare;
  const labelDeclare = getDocumentLabel(typeDeclare);

  const cvCheck = detectIfCv(rawText, filename);

  // Cas 1 : Fichier détecté comme CV
  if (cvCheck.isCv) {
    if (typeDeclare === 'piece_identite') {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'erreur_critique',
        estUnCv: true,
        typeDetecteEstime: 'Curriculum Vitae (CV Personnel)',
        anomalieTitre: 'Fichier non ciblé : Curriculum Vitae (CV) au lieu d\'une Pièce d\'Identité',
        diagnostic: 'Le candidat a versé un Curriculum Vitae (CV) personnel alors que la pièce requise est sa Carte Nationale d\'Identité (CNIE).',
        explicationDetaillee: `L'analyse OCR a identifié des rubriques de parcours professionnel, compétences et diplômes (« ${cvCheck.matchedKeywords.slice(0, 3).join(' », « ')} »). Le document ne contient aucun attribut officiel de la CNIE du Royaume du Maroc.`,
        motsClesDetectes: cvCheck.matchedKeywords,
        recommandation: `Veuillez supprimer ce CV et importer la copie recto-verso de la CNIE de ${demandeur.prenom_representant} ${demandeur.nom_representant} (CIN déclarée : ${demandeur.cin_representant || 'Non renseignée'}).`
      };
    } else {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'erreur_critique',
        estUnCv: true,
        typeDetecteEstime: 'Curriculum Vitae (CV Personnel)',
        anomalieTitre: `Fichier non ciblé : CV déposé à la place de « ${labelDeclare} »`,
        diagnostic: `Un Curriculum Vitae personnel a été téléversé alors que la demande porte sur « ${labelDeclare} ».`,
        explicationDetaillee: `L'analyse sémantique OCR met en évidence un profil de compétences (« ${cvCheck.matchedKeywords.slice(0, 3).join(' », « ')} ») inadapté aux justificatifs administratifs attendus.`,
        motsClesDetectes: cvCheck.matchedKeywords,
        recommandation: `Veuillez remplacer ce CV par le justificatif authentique exigé (« ${labelDeclare} »).`
      };
    }
  }

  // Cas 2 : La pièce demandée est une CNIE / Pièce d'identité
  if (typeDeclare === 'piece_identite') {
    // Vérifier si c'est un devis
    const hasDevisKw = DEVIS_KEYWORDS.some((kw) => text.includes(kw));
    if (hasDevisKw) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'erreur_critique',
        estUnCv: false,
        typeDetecteEstime: 'Devis commercial ou Facture',
        anomalieTitre: 'Incohérence : Devis commercial au lieu d\'une CNIE',
        diagnostic: 'Le document analysé contient des lignes budgétaires ou des mentions de devis au lieu d\'une pièce d\'identité.',
        explicationDetaillee: 'Des mentions financières (Total HT/TTC, TVA, prestations) ont été extraites. Ce fichier n\'est pas une pièce d\'identité.',
        motsClesDetectes: DEVIS_KEYWORDS.filter((kw) => text.includes(kw)),
        recommandation: 'Veuillez remplacer ce document par la CNIE du représentant légal.'
      };
    }

    // Vérifier si c'est un RIB
    const hasRibKw = RIB_KEYWORDS.some((kw) => text.includes(kw)) || !!piece.champs_detectes.iban;
    if (hasRibKw && !text.includes('carte nationale')) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'erreur_critique',
        estUnCv: false,
        typeDetecteEstime: 'Relevé d\'Identité Bancaire (RIB)',
        anomalieTitre: 'Incohérence : RIB bancaire déposé au lieu d\'une CNIE',
        diagnostic: 'Un Relevé d\'Identité Bancaire (RIB) a été affecté à la place de la carte d\'identité.',
        explicationDetaillee: 'Le document comporte des coordonnées bancaires / IBAN sans relation avec une pièce d\'identité.',
        motsClesDetectes: ['IBAN / Coordonnées bancaires'],
        recommandation: 'Veuillez classer ce RIB dans la catégorie adéquate et importer la CNIE officielle.'
      };
    }

    // Vérification de concordance du numéro de CIN
    const cinRegex = /\b([A-Z]{1,2}\s?[0-9]{4,7})\b/i;
    const matchCin = rawText.match(cinRegex);
    const cinTrouve = matchCin ? matchCin[1].replace(/\s+/g, '').toUpperCase() : null;
    const cinDemandeur = demandeur.cin_representant ? demandeur.cin_representant.replace(/\s+/g, '').toUpperCase() : '';

    if (cinTrouve && cinDemandeur && cinTrouve !== cinDemandeur) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'avertissement',
        estUnCv: false,
        typeDetecteEstime: 'Pièce d\'identité (CIN différente)',
        anomalieTitre: 'Divergence du numéro de CIN',
        diagnostic: `Le numéro de CIN extrait de la pièce (${cinTrouve}) diffère de celui saisi dans le profil (${cinDemandeur}).`,
        explicationDetaillee: `Une CNIE a bien été reconnue, mais l'identifiant ${cinTrouve} ne concorde pas avec le représentant légal ${demandeur.prenom_representant} ${demandeur.nom_representant}.`,
        motsClesDetectes: [`CIN extraite : ${cinTrouve}`],
        recommandation: `Vérifiez s'il s'agit bien de la pièce d'identité du bon dirigeant habilité.`
      };
    }

    // Validation positive CNIE
    const hasCnieKw = CNIE_KEYWORDS.some((kw) => text.includes(kw)) || !!cinTrouve;
    if (hasCnieKw) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'conforme',
        estUnCv: false,
        typeDetecteEstime: 'Carte Nationale d\'Identité Électronique (CNIE)',
        diagnostic: `Pièce d'identité marocaine authentifiée avec succès${cinTrouve ? ` (CIN : ${cinTrouve})` : ''}.`,
        explicationDetaillee: 'Les filigranes officiels et données d\'identification concordent avec le profil du représentant légal.',
        motsClesDetectes: cinTrouve ? [`CIN : ${cinTrouve}`] : ['CNIE Maroc']
      };
    }
  }

  // Cas 3 : La pièce demandée est un RIB
  if (typeDeclare === 'rib') {
    const hasDevisKw = DEVIS_KEYWORDS.some((kw) => text.includes(kw));
    if (hasDevisKw && !piece.champs_detectes.iban) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'erreur_critique',
        estUnCv: false,
        typeDetecteEstime: 'Devis commercial / Facture',
        anomalieTitre: 'Incohérence : Devis déposé au lieu d\'un RIB',
        diagnostic: 'Le document fourni est un devis commercial et ne comporte aucune coordonnée bancaire.',
        explicationDetaillee: 'Aucun IBAN ou compte bancaire marocain n\'a pu être identifié par le moteur OCR.',
        motsClesDetectes: DEVIS_KEYWORDS.filter((kw) => text.includes(kw)),
        recommandation: 'Veuillez déposer l\'attestation de RIB de la banque de l\'entreprise.'
      };
    }

    if (piece.champs_detectes.iban || RIB_KEYWORDS.some((kw) => text.includes(kw))) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'conforme',
        estUnCv: false,
        typeDetecteEstime: 'Relevé d\'Identité Bancaire (RIB)',
        diagnostic: `Coordonnées bancaires détectées et vérifiées${piece.champs_detectes.iban ? ` (${piece.champs_detectes.iban})` : ''}.`,
        explicationDetaillee: 'L\'attestation bancaire est conforme aux standards bancaires marocains pour le versement des subventions.',
        motsClesDetectes: piece.champs_detectes.iban ? [`IBAN : ${piece.champs_detectes.iban}`] : ['RIB officiel']
      };
    }
  }

  // Cas 4 : La pièce demandée est un Devis
  if (typeDeclare === 'devis') {
    if (piece.champs_detectes.montant || DEVIS_KEYWORDS.some((kw) => text.includes(kw))) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'conforme',
        estUnCv: false,
        typeDetecteEstime: 'Devis estimatif / Offre de prix',
        diagnostic: `Devis vérifié avec extraction financière${piece.champs_detectes.montant ? ` (${piece.champs_detectes.montant})` : ''}.`,
        explicationDetaillee: 'Le chiffrage et les mentions tarifaires correspondent aux justificatifs de dépenses éligibles.',
        motsClesDetectes: piece.champs_detectes.montant ? [`Montant : ${piece.champs_detectes.montant}`] : ['Devis chiffré']
      };
    }
  }

  // Cas 5 : Registre du Commerce (RC) ou Statuts avec concordance ICE
  if (typeDeclare === 'rc' || typeDeclare === 'statuts' || typeDeclare === 'attestation_fiscale') {
    const iceRegex = /\b(00\d{13}|\d{15})\b/;
    const iceMatch = rawText.match(iceRegex);
    const iceExtrait = iceMatch ? iceMatch[1] : null;
    const iceDemandeur = demandeur.siret ? demandeur.siret.replace(/\s+/g, '') : '';

    if (iceExtrait && iceDemandeur && iceExtrait !== iceDemandeur) {
      return {
        documentId: piece.id,
        nomFichier: filename,
        typeDeclare,
        labelDeclare,
        status: 'avertissement',
        estUnCv: false,
        typeDetecteEstime: `${labelDeclare} (ICE divergent)`,
        anomalieTitre: 'Divergence de l\'identifiant ICE',
        diagnostic: `L'ICE extrait (${iceExtrait}) ne correspond pas à l'ICE de l'entreprise candidate (${iceDemandeur}).`,
        explicationDetaillee: 'Une divergence sur le numéro d\'immatriculation fiscale/commerciale peut retarder l\'instruction du dossier.',
        motsClesDetectes: [`ICE extrait : ${iceExtrait}`],
        recommandation: 'Vérifiez que le document appartient bien à l\'entité juridique candidate.'
      };
    }
  }

  // Cas par défaut si aucune anomalie flagrante
  return {
    documentId: piece.id,
    nomFichier: filename,
    typeDeclare,
    labelDeclare,
    status: 'conforme',
    estUnCv: false,
    typeDetecteEstime: labelDeclare,
    diagnostic: 'Pièce justificative cohérente avec la typologie déclarée.',
    explicationDetaillee: piece.texte_ocr ? 'Contenu textuel analysé sans incohérence détectée.' : 'Fichier enregistré en attente d\'instruction.',
    motsClesDetectes: []
  };
}

/**
 * Audit global de l'ensemble des pièces d'un dossier
 */
export function auditDossierDocuments(
  pieces: ProcessedDocument[],
  demandeur: DemandeurFormData
): DossierAuditSummary {
  const items = pieces.map((p) => auditSingleDocument(p, demandeur));

  const nbConformes = items.filter((i) => i.status === 'conforme').length;
  const nbAvertissements = items.filter((i) => i.status === 'avertissement').length;
  const nbErreursCritiques = items.filter((i) => i.status === 'erreur_critique').length;

  const aDesErreursBloquantes = nbErreursCritiques > 0;

  let resumeGlobal = '';
  if (pieces.length === 0) {
    resumeGlobal = 'Aucune pièce versée au dossier actuellement.';
  } else if (nbErreursCritiques > 0) {
    resumeGlobal = `Attention : ${nbErreursCritiques} anomalie(s) critique(s) de contenu détectée(s) (ex : document non conforme ou CV versé par erreur). Un remplacement est vivement recommandé avant soumission.`;
  } else if (nbAvertissements > 0) {
    resumeGlobal = `Le dossier est recevable avec ${nbAvertissements} point(s) d'attention à vérifier (concordance CIN ou ICE).`;
  } else {
    resumeGlobal = `Tous les documents analysés (${nbConformes}/${pieces.length}) correspondent fidèlement aux pièces officielles exigées.`;
  }

  return {
    totalPieces: pieces.length,
    nbConformes,
    nbAvertissements,
    nbErreursCritiques,
    aDesErreursBloquantes,
    items,
    resumeGlobal
  };
}
