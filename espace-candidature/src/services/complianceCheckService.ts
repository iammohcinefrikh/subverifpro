import type { MockCandidateUser } from '../types/auth';
import type { DocumentType } from '../types/ocr';
import { findProgram } from '../config/programs';
import { getDocumentTypeDefinition } from '../config/documentTypes';

/**
 * Normalise un type de document ou alias (ex: 'cnie', 'cin' -> 'piece_identite', 'plan_action_transformation' -> 'plan_action')
 */
export function normalizeDocumentType(type?: string | null): DocumentType {
  if (!type) return 'autre';
  const clean = String(type).trim().toLowerCase();

  // Alias CNIE / CIN / Passeport -> piece_identite
  if (
    clean === 'cnie' ||
    clean === 'cin' ||
    clean === 'passeport' ||
    clean === 'carte_identite' ||
    clean === 'carte_nationale_identite'
  ) {
    return 'piece_identite';
  }

  // Alias Plan d'action / transformation -> plan_action
  if (
    clean === 'plan_action_transformation' ||
    clean === 'plan_action_digitalisation' ||
    clean === 'plan_transformation' ||
    clean === 'feuille_route'
  ) {
    return 'plan_action';
  }

  // Alias Registre de Commerce
  if (clean === 'registre_commerce' || clean === 'modele_j') {
    return 'rc';
  }

  // Alias Statuts
  if (clean === 'statuts_societe' || clean === 'pv_constitutif' || clean === 'statuts_entreprise') {
    return 'statuts';
  }

  // Alias RIB
  if (clean === 'attestation_rib' || clean === 'releve_identite_bancaire') {
    return 'rib';
  }

  // Alias États financiers / Bilans
  if (clean === 'bilan' || clean === 'bilans_comptables' || clean === 'liasses_comptables') {
    return 'etats_financiers';
  }

  // Alias Liasses fiscales
  if (clean === 'liasse_fiscale' || clean === 'declaration_fiscale' || clean === 'declarations_fiscales') {
    return 'liasses_fiscales';
  }

  // Alias Étude environnementale
  if (clean === 'etude_impact_environnemental' || clean === 'diagnostic_vert' || clean === 'diagnostic_environnemental') {
    return 'etude_environnementale';
  }

  // Alias Attestations
  if (clean === 'cnss' || clean === 'attestation_cnss_regularite') {
    return 'attestation_cnss';
  }
  if (clean === 'attestation_fiscale_regularite' || clean === 'quitus_fiscal') {
    return 'attestation_fiscale';
  }

  // Alias Business plan
  if (clean === 'plan_affaires' || clean === 'etude_projet' || clean === 'presentation_projet') {
    return 'business_plan';
  }

  return clean as DocumentType;
}

/**
 * Vérifie et réconcilie la liste des pièces requises avec les pièces téléversées
 */
export function getMissingDocuments(
  piecesRequises: Array<string | { document_type: string }>,
  uploadedDocuments: Array<{ document_type?: string; type_declare?: string; type?: string; [key: string]: any }>
): {
  missingTypes: DocumentType[];
  presentTypes: DocumentType[];
  completenessRate: number;
  isComplete: boolean;
} {
  const normalizedRequired: DocumentType[] = (piecesRequises || []).map((req) => {
    const raw = typeof req === 'string' ? req : req.document_type;
    return normalizeDocumentType(raw);
  });

  const presentSet = new Set<DocumentType>();
  (uploadedDocuments || []).forEach((doc) => {
    const rawType = doc.document_type || doc.type_declare || doc.type;
    if (rawType) {
      presentSet.add(normalizeDocumentType(rawType));
    }
  });

  const missingTypes = normalizedRequired.filter((req) => !presentSet.has(req));
  const presentTypes = normalizedRequired.filter((req) => presentSet.has(req));

  const mandatoryCount = normalizedRequired.length;
  const presentCount = presentTypes.length;
  const completenessRate = mandatoryCount > 0 ? Math.round((presentCount / mandatoryCount) * 100) : 100;
  const isComplete = missingTypes.length === 0;

  return {
    missingTypes,
    presentTypes,
    completenessRate,
    isComplete
  };
}

export interface ComplianceDocument {
  type: string;
  nom?: string;
  statut?: string;
  date_depot?: string;
  ocr_confidence?: number;
  [key: string]: any;
}

export interface ComplianceCheck {
  id: string;
  application_id: string;
  program_id: string;
  completeness_rate: number;
  status: 'CONFORME' | 'INCOMPLETE' | 'NON_CONFORME' | 'EN_COURS' | string;
  documents: ComplianceDocument[];
  missing_documents: (string | ComplianceDocument)[];
  expired_documents: (string | ComplianceDocument)[];
  present_documents: (string | ComplianceDocument)[];
  mandatory_documents_count: number;
  present_count: number;
  missing_count: number;
  expired_count: number;
  checked_at: string;
  created_at?: string;
  updated_at?: string;
  candidate_id?: string | null;
}

/**
 * Récupère le contrôle de conformité des pièces depuis la table public.compliance_checks
 */
export async function fetchComplianceCheckFromDb(
  candidateId?: string,
  applicationId?: string
): Promise<ComplianceCheck | null> {
  try {
    const params = new URLSearchParams();
    if (candidateId) params.set('candidate_id', candidateId);
    if (applicationId) params.set('application_id', applicationId);

    const res = await fetch(`/api/compliance-checks?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.complianceCheck) {
      const check = data.complianceCheck;
      return {
        ...check,
        completeness_rate: Number(check.completeness_rate || 0),
        documents: typeof check.documents === 'string' ? JSON.parse(check.documents) : (check.documents || []),
        missing_documents: typeof check.missing_documents === 'string' ? JSON.parse(check.missing_documents) : (check.missing_documents || []),
        expired_documents: typeof check.expired_documents === 'string' ? JSON.parse(check.expired_documents) : (check.expired_documents || []),
        present_documents: typeof check.present_documents === 'string' ? JSON.parse(check.present_documents) : (check.present_documents || []),
        mandatory_documents_count: Number(check.mandatory_documents_count || 0),
        present_count: Number(check.present_count || 0),
        missing_count: Number(check.missing_count || 0),
        expired_count: Number(check.expired_count || 0),
      };
    }

    return null;
  } catch (err) {
    console.warn('[ComplianceService] Erreur lors de la récupération depuis compliance_checks:', err);
    return null;
  }
}

/**
 * Enregistre ou met à jour un contrôle de conformité dans public.compliance_checks
 */
export async function saveComplianceCheckToDb(
  payload: Partial<ComplianceCheck>
): Promise<ComplianceCheck | null> {
  try {
    const res = await fetch('/api/compliance-checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.complianceCheck) {
      const check = data.complianceCheck;
      return {
        ...check,
        completeness_rate: Number(check.completeness_rate || 0),
        documents: typeof check.documents === 'string' ? JSON.parse(check.documents) : (check.documents || []),
        missing_documents: typeof check.missing_documents === 'string' ? JSON.parse(check.missing_documents) : (check.missing_documents || []),
        expired_documents: typeof check.expired_documents === 'string' ? JSON.parse(check.expired_documents) : (check.expired_documents || []),
        present_documents: typeof check.present_documents === 'string' ? JSON.parse(check.present_documents) : (check.present_documents || []),
      };
    }
    return null;
  } catch (err) {
    console.error('[ComplianceService] Erreur lors de l’enregistrement dans compliance_checks:', err);
    return null;
  }
}

/**
 * Génère et initialise le contrôle de conformité pour un candidat s'il n'existe pas encore en base
 */
export function buildInitialComplianceCheckFromUser(user: MockCandidateUser): Partial<ComplianceCheck> {
  const prog = findProgram(user.projet?.programme_id);
  const rawPiecesRequises = (prog && prog.requirements.length > 0)
    ? prog.requirements.map((r) => r.document_type)
    : (user.dossier.pieces_requises?.length
        ? user.dossier.pieces_requises
        : ['piece_identite', 'rc', 'statuts', 'rib', 'projet_rd', 'plan_financement', 'devis']);

  const { missingTypes, presentTypes, completenessRate, isComplete } = getMissingDocuments(
    rawPiecesRequises,
    user.dossier.pieces || []
  );

  const status = isComplete ? 'CONFORME' : 'INCOMPLETE';

  return {
    candidate_id: user.id,
    application_id: user.dossier.dossier_id,
    program_id: user.projet?.programme_id || prog?.id || 'prog-tatwir-rd',
    completeness_rate: completenessRate,
    status,
    mandatory_documents_count: rawPiecesRequises.length,
    present_count: presentTypes.length,
    missing_count: missingTypes.length,
    expired_count: 0,
    present_documents: (user.dossier.pieces || []).map((p) => {
      const normType = normalizeDocumentType(p.type_declare || (p as any).document_type);
      const def = getDocumentTypeDefinition(normType);
      return {
        type: normType,
        document_type: normType,
        nom: p.nom_fichier,
        name: def?.label || p.nom_fichier,
        statut: 'CONFORME',
        status: 'PRESENT',
        date_depot: (p as unknown as Record<string, unknown>).date_depot as string || new Date().toISOString(),
        ocr_confidence: typeof (p as unknown as Record<string, unknown>).ocr_score === 'number' ? (p as unknown as Record<string, unknown>).ocr_score as number : 99
      };
    }),
    missing_documents: missingTypes.map((t) => {
      const def = getDocumentTypeDefinition(t);
      return {
        type: t,
        document_type: t,
        statut: 'MANQUANT',
        status: 'MISSING',
        name: def?.label || `Pièce requise (${t})`,
        nom: def?.label || `Pièce requise (${t})`
      };
    }),
    expired_documents: [],
    documents: (user.dossier.pieces || []).map((p) => {
      const normType = normalizeDocumentType(p.type_declare || (p as any).document_type);
      return {
        type: normType,
        document_type: normType,
        nom: p.nom_fichier,
        statut: 'CONFORME',
        status: 'PRESENT'
      };
    })
  };
}

/**
 * Réconcilie dynamiquement un contrôle de conformité avec les exigences réelles du programme du candidat.
 * Corrige les faux positifs/négatifs (ex: programme MOWAKABA évalué par erreur sur 8 pièces au lieu de 6).
 */
export function reconcileComplianceCheckWithProgram(
  rawCheck: ComplianceCheck | null | undefined,
  user: MockCandidateUser
): ComplianceCheck {
  const progId = user.projet?.programme_id || 'prog-istitmar-tpe';
  const prog = findProgram(progId);
  const officialReqs = (prog?.requirements || []).filter((r) => r.mandatory !== false);
  const requiredTypes = officialReqs.length > 0
    ? officialReqs.map((r) => normalizeDocumentType(r.document_type))
    : ['piece_identite', 'rc', 'statuts', 'rib'];

  const { missingTypes, presentTypes, completenessRate, isComplete } = getMissingDocuments(
    requiredTypes,
    user.dossier.pieces || []
  );

  const status = isComplete ? 'CONFORME' : 'INCOMPLETE';

  // Si aucun check existant, initialiser proprement
  if (!rawCheck) {
    return buildInitialComplianceCheckFromUser(user) as ComplianceCheck;
  }

  // Vérifier si le check en base était faussé (programme différent, ou missing_count erroné, ou pièces non requises présentes dans missing_documents)
  const isMismatched =
    rawCheck.program_id !== progId ||
    rawCheck.mandatory_documents_count !== requiredTypes.length ||
    rawCheck.missing_count !== missingTypes.length ||
    rawCheck.status !== status ||
    (isComplete && (rawCheck.missing_count > 0 || rawCheck.status !== 'CONFORME'));

  const reconciledCheck: ComplianceCheck = {
    ...rawCheck,
    program_id: progId,
    candidate_id: user.id,
    application_id: user.dossier.dossier_id || rawCheck.application_id,
    completeness_rate: completenessRate,
    status,
    mandatory_documents_count: requiredTypes.length,
    present_count: presentTypes.length,
    missing_count: missingTypes.length,
    expired_count: 0,
    missing_documents: missingTypes.map((t) => {
      const def = getDocumentTypeDefinition(t);
      const reqMeta = officialReqs.find((r) => normalizeDocumentType(r.document_type) === t);
      return {
        type: t,
        document_type: t,
        statut: 'MANQUANT',
        status: 'MISSING',
        name: reqMeta?.name || def?.label || `Pièce requise (${t})`,
        nom: reqMeta?.name || def?.label || `Pièce requise (${t})`
      };
    }),
    present_documents: (user.dossier.pieces || []).map((p) => {
      const normType = normalizeDocumentType(p.type_declare || (p as any).document_type);
      const def = getDocumentTypeDefinition(normType);
      const reqMeta = officialReqs.find((r) => normalizeDocumentType(r.document_type) === normType);
      return {
        type: normType,
        document_type: normType,
        nom: p.nom_fichier,
        name: reqMeta?.name || def?.label || p.nom_fichier,
        statut: 'CONFORME',
        status: 'PRESENT'
      };
    }),
    documents: (user.dossier.pieces || []).map((p) => {
      const normType = normalizeDocumentType(p.type_declare || (p as any).document_type);
      return {
        type: normType,
        document_type: normType,
        nom: p.nom_fichier,
        statut: 'CONFORME',
        status: 'PRESENT'
      };
    })
  };

  // Si une divergence était constatée, synchroniser en arrière-plan avec la table PostgreSQL
  if (isMismatched) {
    saveComplianceCheckToDb({
      id: rawCheck.id,
      application_id: user.dossier.dossier_id,
      candidate_id: user.id,
      program_id: progId,
      completeness_rate: completenessRate,
      status,
      mandatory_documents_count: requiredTypes.length,
      present_count: presentTypes.length,
      missing_count: missingTypes.length,
      missing_documents: reconciledCheck.missing_documents,
      present_documents: reconciledCheck.present_documents,
      documents: reconciledCheck.documents
    }).catch((err) => console.warn('[ComplianceService] Erreur sync correction check:', err));
  }

  return reconciledCheck;
}

