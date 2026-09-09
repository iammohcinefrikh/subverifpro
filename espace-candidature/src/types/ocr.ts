export type DocumentType =
  | 'piece_identite'
  | 'rc'
  | 'statuts'
  | 'rib'
  | 'devis'
  | 'liasses_fiscales'
  | 'etats_financiers'
  | 'plan_investissement'
  | 'business_plan'
  | 'etude_environnementale'
  | 'attestation_cnss'
  | 'attestation_fiscale'
  | 'plan_action'
  | 'justificatif_domicile'
  | 'attestation_credit'
  | 'justificatif_activite'
  | 'projet_rd'
  | 'plan_financement'
  | 'justificatif_statut'
  | 'formulaire'
  | 'attestation'
  | 'autre';

export interface DetectedFields {
  montant?: string;
  date?: string;
  iban?: string;
  siret?: string;
}

export type OcrStatus = 'en_attente' | 'en_cours' | 'succes' | 'echec';

export interface ProcessedDocument {
  id: string;
  file: File;
  nom_fichier: string;
  taille: number;
  type_mime: string;
  type_declare: DocumentType;
  type_suggere_ocr?: DocumentType;
  texte_ocr: string;
  champs_detectes: DetectedFields;
  fichier_base64: string;
  statut_ocr: OcrStatus;
  ocr_progression?: number; // 0 to 100
  ocr_methode?: 'pdf_natif' | 'pdf_scanne_tesseract' | 'image_tesseract' | 'saisie_manuelle';
  message_erreur?: string;
}
