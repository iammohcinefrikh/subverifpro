import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { demandeurSchema } from '../../types/form';
import type { DemandeurFormData } from '../../types/form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Building2, ArrowRight, MapPin, Hash, UserCheck, Mail, Phone, CreditCard, Calendar, Users } from 'lucide-react';
import { CandidateSelectorModal } from '../modals/CandidateSelectorModal';
import { MOCK_CANDIDATES } from '../../config/mockCandidates';

interface Step1Props {
  initialData?: Partial<DemandeurFormData>;
  onNext: (data: DemandeurFormData) => void;
  selectedCandidateId?: string;
  onSelectCandidate?: (candidateId: string) => void;
}

const STRUCTURE_TYPES = [
  { value: 'association', label: 'Association (loi 1901 ou équivalent)' },
  { value: 'entreprise', label: 'Entreprise commerciale (SARL, SAS, SA, Succursale)' },
  { value: 'independant', label: 'Auto-entrepreneur / Profession libérale' },
  { value: 'etablissement_public', label: 'Établissement public / Collectivité territoriale' },
  { value: 'autre', label: 'Coopérative ou organisme à but non lucratif' }
];

export const Step1Applicant: React.FC<Step1Props> = ({
  initialData,
  onNext,
  selectedCandidateId = 'cand-1',
  onSelectCandidate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DemandeurFormData>({
    resolver: zodResolver(demandeurSchema),
    defaultValues: {
      structure_type: initialData?.structure_type || 'entreprise',
      nom_ou_raison_sociale: initialData?.nom_ou_raison_sociale || '',
      siret: initialData?.siret || '',
      secteur_activite: initialData?.secteur_activite || '',
      adresse: initialData?.adresse || '',
      code_postal: initialData?.code_postal || '',
      ville: initialData?.ville || '',
      region: initialData?.region || '',
      anciennete_annees: initialData?.anciennete_annees ?? 4,
      nom_representant: initialData?.nom_representant || '',
      prenom_representant: initialData?.prenom_representant || '',
      date_naissance_representant: initialData?.date_naissance_representant || '',
      cin_representant: initialData?.cin_representant || '',
      email_representant: initialData?.email_representant || '',
      telephone_representant: initialData?.telephone_representant || ''
    }
  });

  // Synchronisation dynamique si un candidat démo est sélectionné
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({
        structure_type: initialData.structure_type || 'entreprise',
        nom_ou_raison_sociale: initialData.nom_ou_raison_sociale || '',
        siret: initialData.siret || '',
        secteur_activite: initialData.secteur_activite || '',
        adresse: initialData.adresse || '',
        code_postal: initialData.code_postal || '',
        ville: initialData.ville || '',
        region: initialData.region || '',
        anciennete_annees: initialData.anciennete_annees ?? 4,
        nom_representant: initialData.nom_representant || '',
        prenom_representant: initialData.prenom_representant || '',
        date_naissance_representant: initialData.date_naissance_representant || '',
        cin_representant: initialData.cin_representant || '',
        email_representant: initialData.email_representant || '',
        telephone_representant: initialData.telephone_representant || ''
      });
    }
  }, [initialData, reset]);

  return (
    <>
      <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-8 text-left">
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Étape 1 sur 5</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-600" />
              Profil du demandeur
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Renseignez l'identité juridique et les coordonnées de la structure candidate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <select
              aria-label="Sélectionner un candidat démo"
              value={selectedCandidateId}
              onChange={(e) => onSelectCandidate?.(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-brand-300 bg-white text-brand-800 shadow-sm hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer max-w-[220px] sm:max-w-xs truncate"
              title="Sélectionner rapidement un profil parmi les 100 mockés"
            >
              <optgroup label="100 Candidats Démo Disponibles">
                {MOCK_CANDIDATES.map((cand, idx) => (
                  <option key={cand.id} value={cand.id}>
                    {idx + 1}. {cand.nomCourt} ({cand.demandeur.ville})
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-brand-300 bg-brand-50/70 hover:bg-brand-100 text-brand-700 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
              title="Ouvrir la liste complète des 100 profils démo avec recherche et filtres"
            >
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>100 Profils</span>
            </button>
          </div>
        </div>

      {/* Identité Juridique */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Hash className="w-4 h-4 text-brand-600" />
          Identification administrative
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Type de structure"
            required
            options={STRUCTURE_TYPES}
            error={errors.structure_type?.message}
            {...register('structure_type')}
          />

          <Input
            label="Nom ou raison sociale"
            placeholder="Ex : Association Solidarité Durable"
            required
            error={errors.nom_ou_raison_sociale?.message}
            {...register('nom_ou_raison_sociale')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Identifiant légal (ICE, RC ou SIRET)"
            placeholder="Ex : 002849103000076 (ICE) ou 83492019400028"
            helperText="Numéro ICE (15 chiffres), Registre du Commerce ou SIRET officiel"
            required
            error={errors.siret?.message}
            {...register('siret')}
          />

          <Input
            label="Secteur d'activité"
            placeholder="Ex : Numérique, Culture, Écologie, Social..."
            required
            error={errors.secteur_activite?.message}
            {...register('secteur_activite')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Ancienneté de la structure (en années)"
            type="number"
            min="0"
            max="150"
            required
            error={errors.anciennete_annees?.message}
            {...register('anciennete_annees', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Représentant Légal & Contact */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserCheck className="w-4 h-4 text-brand-600" />
          Représentant légal & Coordonnées du contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            label="Prénom"
            placeholder="Ex : Youssef"
            required
            error={errors.prenom_representant?.message}
            {...register('prenom_representant')}
          />

          <Input
            label="Nom de famille"
            placeholder="Ex : El Amrani"
            required
            error={errors.nom_representant?.message}
            {...register('nom_representant')}
          />

          <Input
            label="Date de naissance"
            type="date"
            required
            helperText="Date de naissance du déclarant"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.date_naissance_representant?.message}
            {...register('date_naissance_representant')}
          />

          <Input
            label="Numéro CIN / CNIE"
            placeholder="Ex : BK492018"
            helperText="Carte d'Identité Nationale"
            leftIcon={<CreditCard className="w-4 h-4" />}
            required
            error={errors.cin_representant?.message}
            {...register('cin_representant')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Adresse e-mail"
            type="email"
            placeholder="Ex : contact@maroc-numerique.ma"
            helperText="Pour les notifications relatives à ce dossier"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            error={errors.email_representant?.message}
            {...register('email_representant')}
          />

          <Input
            label="Numéro de téléphone"
            type="tel"
            placeholder="Ex : 0661234567 ou +212661234567"
            helperText="Ligne directe ou mobile de contact"
            leftIcon={<Phone className="w-4 h-4" />}
            required
            error={errors.telephone_representant?.message}
            {...register('telephone_representant')}
          />
        </div>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-4 h-4 text-brand-600" />
          Localisation du siège social
        </h3>

        <div className="grid grid-cols-1 gap-6">
          <Input
            label="Adresse postale"
            placeholder="Numéro et nom de voie"
            required
            error={errors.adresse?.message}
            {...register('adresse')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Input
            label="Code postal"
            placeholder="Ex : 75001"
            required
            error={errors.code_postal?.message}
            {...register('code_postal')}
          />

          <Input
            label="Ville"
            placeholder="Ex : Paris"
            required
            error={errors.ville?.message}
            {...register('ville')}
          />

          <Input
            label="Région / Zone géographique"
            placeholder="Ex : Île-de-France"
            required
            error={errors.region?.message}
            {...register('region')}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continuer vers le Projet
        </Button>
      </div>
    </form>

    <CandidateSelectorModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSelectCandidate={(cand) => onSelectCandidate?.(cand.id)}
      selectedCandidateId={selectedCandidateId}
    />
  </>
);
};
