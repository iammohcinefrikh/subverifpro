import type { MockCandidateUser } from '../types/auth';

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
  const piecesRequises = user.dossier.pieces_requises || [];
  const piecesPresentes = user.dossier.pieces || [];

  const existingTypes = new Set(piecesPresentes.map((p) => p.type_declare));
  const missingTypes = piecesRequises.filter((t) => !existingTypes.has(t));

  const mandatoryCount = piecesRequises.length || 4;
  const presentCount = piecesPresentes.length;
  const missingCount = missingTypes.length;
  const rate = Math.min(100, Math.round((presentCount / (mandatoryCount || 1)) * 100));

  const status = missingCount === 0 && presentCount >= mandatoryCount ? 'CONFORME' : 'INCOMPLETE';

  return {
    candidate_id: user.id,
    application_id: user.dossier.dossier_id,
    program_id: 'maroc-pme',
    completeness_rate: rate,
    status,
    mandatory_documents_count: mandatoryCount,
    present_count: presentCount,
    missing_count: missingCount,
    expired_count: 0,
    present_documents: piecesPresentes.map((p) => ({
      type: p.type_declare,
      nom: p.nom_fichier,
      statut: 'CONFORME',
      date_depot: (p as unknown as Record<string, unknown>).date_depot as string || new Date().toISOString(),
      ocr_confidence: typeof (p as unknown as Record<string, unknown>).ocr_score === 'number' ? (p as unknown as Record<string, unknown>).ocr_score as number : 99
    })),
    missing_documents: missingTypes.map((t) => ({
      type: t,
      statut: 'MANQUANT',
      nom: `Pièce requise (${t})`
    })),
    expired_documents: [],
    documents: piecesPresentes.map((p) => ({
      type: p.type_declare,
      nom: p.nom_fichier,
      statut: 'CONFORME'
    }))
  };
}
