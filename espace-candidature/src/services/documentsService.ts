/**
 * Service d'interaction avec la table Supabase public.application_documents
 * Stockage des métadonnées des pièces jointes et liens d'accès Supabase Storage.
 */

export interface ApplicationDocumentRecord {
  id: string;
  application_id: string;
  type_document: string;
  taille: number;
  storage_path: string;
  url: string;
  statut_ocr: string;
}

export interface ApplicationDocumentPayload {
  application_id: string;
  type_document: string;
  taille: number;
  storage_path?: string;
  url?: string;
  statut_ocr?: string;
  nom_fichier?: string;
}

/**
 * Récupère la liste des pièces jointes pour une candidature donnée (par application_id ou candidate_id)
 */
export async function fetchApplicationDocuments(
  applicationId?: string,
  candidateId?: string
): Promise<ApplicationDocumentRecord[]> {
  try {
    const params = new URLSearchParams();
    if (applicationId) params.append('application_id', applicationId);
    if (candidateId) params.append('candidate_id', candidateId);

    const res = await fetch(`/api/application-documents?${params.toString()}`);
    if (!res.ok) {
      console.warn('[DocumentsService] Impossible de charger les documents:', res.statusText);
      return [];
    }

    const json = await res.json();
    return json.documents || [];
  } catch (err) {
    console.error('[DocumentsService] Erreur fetchApplicationDocuments:', err);
    return [];
  }
}

/**
 * Enregistre une ou plusieurs pièces justificatives dans application_documents
 */
export async function saveApplicationDocuments(
  applicationId: string,
  documents: ApplicationDocumentPayload[]
): Promise<ApplicationDocumentRecord[]> {
  try {
    const res = await fetch('/api/application-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: applicationId,
        documents
      })
    });

    if (!res.ok) {
      console.warn('[DocumentsService] Erreur enregistrement documents:', res.statusText);
      return [];
    }

    const json = await res.json();
    return json.documents || [];
  } catch (err) {
    console.error('[DocumentsService] Erreur saveApplicationDocuments:', err);
    return [];
  }
}
