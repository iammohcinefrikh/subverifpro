import type { DemandeurFormData, ProjetFormData, BudgetFormData } from './form';
import type { DocumentType, DetectedFields } from './ocr';

export interface WebhookPiecePayload {
  nom_fichier: string;
  type_declare: DocumentType;
  type_suggere_ocr?: DocumentType;
  texte_ocr: string;
  champs_detectes: DetectedFields;
  fichier_base64: string;
  statut_ocr: string;
}

export interface WebhookDossierPayload {
  dossier_id: string;
  date_soumission: string; // ISO-8601
  demandeur: DemandeurFormData;
  projet: ProjetFormData;
  budget: BudgetFormData;
  pieces: WebhookPiecePayload[];
  certification_sur_honneur: boolean;
}

export interface WebhookComplementPayload {
  type: 'complement_pieces';
  dossier_id: string;
  date_transmission: string; // ISO-8601
  demandeur_email: string;
  pieces_ajoutees: WebhookPiecePayload[];
  statut_apres_envoi: 'en_cours_examen';
  remarques_candidat?: string;
}

export interface WebhookResponse {
  success: boolean;
  status: number;
  message?: string;
  data?: unknown;
}

