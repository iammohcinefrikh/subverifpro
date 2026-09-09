import type { DemandeurFormData, ProjetFormData, BudgetFormData } from './form';
import type { DocumentType } from './ocr';
import type { WebhookPiecePayload } from './webhook';

export type DossierStatus =
  | 'en_attente'
  | 'documents_manquants'
  | 'en_cours_examen'
  | 'valide'
  | 'refuse';

export interface DossierMetadata {
  dossier_id: string;
  date_soumission: string; // ISO string
  statut: DossierStatus;
  pieces_requises: DocumentType[];
  pieces: WebhookPiecePayload[];
  remarques_instructeur?: string;
  decision_date?: string;
}

export interface MockCandidateUser {
  id: string;
  email: string;
  password: string; // Mot de passe fictif de démo (en clair dans le cadre du mock)
  nomCourt: string;
  structureNom: string;
  structureType: string;
  badge: string;
  demandeur: DemandeurFormData;
  projet: ProjetFormData;
  budget: BudgetFormData;
  dossier: DossierMetadata;
  hasSubmittedDossier?: boolean;
}

export interface SignUpFormData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthSession {
  user: MockCandidateUser;
  token: string;
  connectedAt: string;
}

