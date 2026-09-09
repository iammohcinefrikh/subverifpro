import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema } from '../../types/form';
import type { BudgetFormData } from '../../types/form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calculator, ArrowRight, ArrowLeft, Plus, Trash2, Sparkles, PieChart, Coins } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Step3Props {
  initialData?: Partial<BudgetFormData>;
  onNext: (data: BudgetFormData) => void;
  onPrev: () => void;
}

export const Step3Budget: React.FC<Step3Props> = ({ initialData, onNext, onPrev }) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      montant_total: initialData?.montant_total ?? 45000,
      montant_demande: initialData?.montant_demande ?? 25000,
      depenses: initialData?.depenses && initialData.depenses.length > 0 ? initialData.depenses : [
        { id: uuidv4(), libelle: 'Acquisition matériel informatique reconditionné', montant: 18000 },
        { id: uuidv4(), libelle: 'Aménagement véhicule itinérant & borne satellite', montant: 15000 },
        { id: uuidv4(), libelle: 'Conception supports pédagogiques & médiation', montant: 12000 }
      ],
      financements: initialData?.financements && initialData.financements.length > 0 ? initialData.financements : [
        { id: uuidv4(), financeur: 'Subvention demandée (ce guichet)', montant: 25000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Autofinancement association', montant: 10000, statut: 'acquis' },
        { id: uuidv4(), financeur: 'Conseil Régional (aide mobilité)', montant: 10000, statut: 'sollicite' }
      ]
    }
  });

  const {
    fields: depenseFields,
    append: appendDepense,
    remove: removeDepense
  } = useFieldArray({
    control,
    name: 'depenses'
  });

  const {
    fields: financementFields,
    append: appendFinancement,
    remove: removeFinancement
  } = useFieldArray({
    control,
    name: 'financements'
  });

  const watchMontantTotal = watch('montant_total') || 0;
  const watchMontantDemande = watch('montant_demande') || 0;
  const watchDepenses = watch('depenses') || [];
  const watchFinancements = watch('financements') || [];

  const totalDepensesCalcule = watchDepenses.reduce((acc, curr) => acc + (Number(curr.montant) || 0), 0);
  const totalFinancementsCalcule = watchFinancements.reduce((acc, curr) => acc + (Number(curr.montant) || 0), 0);

  // Synchronisation éventuelle pour faciliter la vie de l'utilisateur
  const handleSyncDepensesToTotal = () => {
    setValue('montant_total', totalDepensesCalcule);
  };

  const handlePrefillDemo = () => {
    setValue('montant_total', 480000);
    setValue('montant_demande', 288000);
    setValue('depenses', [
      { id: uuidv4(), libelle: 'Serveurs de calcul Cloud & GPU Hardware (selon Devis Fournisseur)', montant: 288000 },
      { id: uuidv4(), libelle: 'Installation réseau haute disponibilité & baie rack', montant: 72000 },
      { id: uuidv4(), libelle: 'Déploiement logiciel IA & cybersécurité Linux', montant: 60000 },
      { id: uuidv4(), libelle: 'Formation technique des ingénieurs & accompagnement', montant: 60000 }
    ]);
    setValue('financements', [
      { id: uuidv4(), financeur: 'Subvention sollicitée (Fonds Maroc Digital 2030)', montant: 288000, statut: 'sollicite' },
      { id: uuidv4(), financeur: 'Apport propre ATLAS TECH SOLUTIONS SARL', montant: 112000, statut: 'acquis' },
      { id: uuidv4(), financeur: 'Financement bancaire d\'investissement (Attijariwafa Bank)', montant: 80000, statut: 'acquis' }
    ]);
  };

  const pctSubvention = watchMontantTotal > 0
    ? Math.min(100, Math.round((watchMontantDemande / watchMontantTotal) * 100))
    : 0;

  return (
    <form id="wizard-active-form" onSubmit={handleSubmit(onNext)} noValidate className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Étape 3 sur 5</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-brand-600" />
            Budget prévisionnel
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Définissez l'équilibre financier de l'opération, la répartition des dépenses et les cofinancements.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-brand-300 bg-brand-50/70 hover:bg-brand-100 text-brand-700 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
          title="Préremplir avec un exemple de budget équilibré"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Exemple budget 600k (DH / €)</span>
        </button>
      </div>

      {/* Montants globaux */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Coins className="w-4 h-4 text-brand-600" />
          Enveloppe financière
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Coût total prévisionnel du projet (€)"
            type="number"
            min="0"
            step="any"
            required
            error={errors.montant_total?.message}
            {...register('montant_total', { valueAsNumber: true })}
          />

          <Input
            label="Montant de la subvention demandée (€)"
            type="number"
            min="0"
            step="any"
            required
            error={errors.montant_demande?.message}
            {...register('montant_demande', { valueAsNumber: true })}
          />
        </div>

        {/* Taux de subvention indicateur */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PieChart className="w-5 h-5 text-brand-600 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-500">Taux de financement public sollicité</p>
              <p className="text-sm font-bold text-slate-900">
                {pctSubvention} % du coût total du projet
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                pctSubvention > 80 ? 'bg-amber-500' : 'bg-brand-600'
              }`}
              style={{ width: `${pctSubvention}%` }}
            />
          </div>
        </div>
      </div>

      {/* Postes de dépenses */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Répartition des dépenses par poste
            </h3>
            <p className="text-xs text-slate-500">
              Total cumulé des dépenses saisies : <strong className="text-slate-900">{totalDepensesCalcule.toLocaleString('fr-FR')} €</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {totalDepensesCalcule !== watchMontantTotal && totalDepensesCalcule > 0 && (
              <button
                type="button"
                onClick={handleSyncDepensesToTotal}
                className="text-xs text-brand-600 hover:text-brand-800 underline font-medium cursor-pointer"
              >
                Ajuster coût total à ce cumul
              </button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendDepense({ id: uuidv4(), libelle: '', montant: 1000 })}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Ajouter une dépense
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {depenseFields.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    placeholder="Libellé du poste (ex : Matériel, Prestation, Communication...)"
                    className="w-full text-sm py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    {...register(`depenses.${index}.libelle` as const)}
                  />
                  {errors.depenses?.[index]?.libelle && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.depenses[index]?.libelle?.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Montant"
                      className="w-full text-sm py-2 pl-3 pr-8 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      {...register(`depenses.${index}.montant` as const, { valueAsNumber: true })}
                    />
                    <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">€</span>
                  </div>
                  {errors.depenses?.[index]?.montant && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.depenses[index]?.montant?.message}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeDepense(index)}
                disabled={depenseFields.length <= 1}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-0.5"
                title="Supprimer ce poste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {errors.depenses?.message && (
            <p className="text-xs text-rose-600">{errors.depenses.message}</p>
          )}
        </div>
      </div>

      {/* Plan de financement */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Plan de financement (Autres financeurs & fonds propres)
            </h3>
            <p className="text-xs text-slate-500">
              Total cumulé des financements : <strong className="text-slate-900">{totalFinancementsCalcule.toLocaleString('fr-FR')} €</strong>
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendFinancement({ id: uuidv4(), financeur: '', montant: 5000, statut: 'sollicite' })}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Ajouter un financeur
          </Button>
        </div>

        <div className="space-y-3">
          {financementFields.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    placeholder="Nom du co-financeur ou fonds propres"
                    className="w-full text-sm py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    {...register(`financements.${index}.financeur` as const)}
                  />
                  {errors.financements?.[index]?.financeur && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.financements[index]?.financeur?.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Montant"
                      className="w-full text-sm py-2 pl-3 pr-8 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      {...register(`financements.${index}.montant` as const, { valueAsNumber: true })}
                    />
                    <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">€</span>
                  </div>
                  {errors.financements?.[index]?.montant && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.financements[index]?.montant?.message}</p>
                  )}
                </div>

                <div>
                  <select
                    className="w-full text-sm py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    {...register(`financements.${index}.statut` as const)}
                  >
                    <option value="sollicite">Sollicité (en cours)</option>
                    <option value="acquis">Acquis (confirmé)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFinancement(index)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-0.5"
                title="Supprimer ce financeur"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Retour au Projet
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continuer vers les Pièces & OCR
        </Button>
      </div>
    </form>
  );
};
