import { z } from 'zod';
import type { ProcessedDocument } from './ocr';

// Step 1: Demandeur
export const demandeurSchema = z.object({
  structure_type: z.enum([
    'association',
    'entreprise',
    'independant',
    'etablissement_public',
    'autre'
  ], {
    errorMap: () => ({ message: 'Veuillez sélectionner le type de structure' })
  }),
  nom_ou_raison_sociale: z.string().min(2, 'Le nom ou la raison sociale est obligatoire'),
  siret: z.string()
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^[0-9A-Za-z]{7,16}$/.test(val), {
      message: 'Identifiant légal invalide : renseignez un ICE (15 chiffres), un RC ou un SIRET'
    }),
  secteur_activite: z.string().min(2, 'Le secteur d\'activité est requis'),
  adresse: z.string().min(5, 'L\'adresse est requise'),
  code_postal: z.string().regex(/^[0-9]{5}$/, 'Le code postal doit comporter 5 chiffres'),
  ville: z.string().min(2, 'La ville est requise'),
  region: z.string().min(2, 'La région ou zone géographique est requise'),
  anciennete_annees: z.number({ invalid_type_error: 'Indiquez un nombre d\'années valide' })
    .min(0, 'L\'ancienneté ne peut pas être négative')
    .max(200, 'Valeur d\'ancienneté trop élevée'),
  // Représentant légal & Contact
  nom_representant: z.string().min(2, 'Le nom du représentant est requis'),
  prenom_representant: z.string().min(2, 'Le prénom du représentant est requis'),
  date_naissance_representant: z.string()
    .min(1, 'La date de naissance est requise')
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d < new Date();
    }, 'Veuillez renseigner une date de naissance valide'),
  cin_representant: z.string()
    .min(4, 'Numéro de CIN requis (ex : BK123456)')
    .transform((val) => val.toUpperCase().replace(/\s+/g, '')),
  email_representant: z.string().email('Veuillez saisir une adresse e-mail valide'),
  telephone_representant: z.string()
    .min(8, 'Numéro de téléphone requis')
    .regex(/^(\+212|0|\+)[0-9\s.-]{8,18}$/, 'Format de téléphone invalide (ex : 0661234567 ou +212661234567)')
});

export type DemandeurFormData = z.infer<typeof demandeurSchema>;

// Step 2: Projet
export const projetSchema = z.object({
  objet_projet: z.string().min(4, 'L\'intitulé / objet du projet doit comporter au moins 4 caractères'),
  description: z.string().min(20, 'La description doit être détaillée (au moins 20 caractères)'),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().min(1, 'La date de fin est requise'),
  programme_id: z.string().min(1, 'Veuillez sélectionner un programme ou catégorie visée')
}).refine((data) => {
  if (!data.date_debut || !data.date_fin) return true;
  return new Date(data.date_fin) >= new Date(data.date_debut);
}, {
  message: 'La date de fin prévisionnelle doit être postérieure ou égale à la date de début',
  path: ['date_fin']
});

export type ProjetFormData = z.infer<typeof projetSchema>;

// Step 3: Budget
export const depenseItemSchema = z.object({
  id: z.string(),
  libelle: z.string().min(2, 'Le libellé du poste de dépense est requis'),
  montant: z.number({ invalid_type_error: 'Montant invalide' }).positive('Le montant doit être supérieur à 0')
});

export const financementItemSchema = z.object({
  id: z.string(),
  financeur: z.string().min(2, 'Le nom du financeur ou l\'origine des fonds est requis'),
  montant: z.number({ invalid_type_error: 'Montant invalide' }).positive('Le montant doit être supérieur à 0'),
  statut: z.enum(['sollicite', 'acquis'])
});

export const budgetSchema = z.object({
  montant_total: z.number({ invalid_type_error: 'Montant total invalide' }).positive('Le montant total doit être supérieur à 0'),
  montant_demande: z.number({ invalid_type_error: 'Montant demandé invalide' }).positive('La subvention demandée doit être supérieure à 0'),
  depenses: z.array(depenseItemSchema).min(1, 'Au moins un poste de dépense est requis'),
  financements: z.array(financementItemSchema)
}).refine((data) => data.montant_demande <= data.montant_total, {
  message: 'Le montant de la subvention demandée ne peut excéder le coût total du projet',
  path: ['montant_demande']
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
export type DepenseItem = z.infer<typeof depenseItemSchema>;
export type FinancementItem = z.infer<typeof financementItemSchema>;

// Complete Dossier State
export interface DossierState {
  demandeur: DemandeurFormData;
  projet: ProjetFormData;
  budget: BudgetFormData;
  pieces: ProcessedDocument[];
  certification_sur_honneur: boolean;
}
