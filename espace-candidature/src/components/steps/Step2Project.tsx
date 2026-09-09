import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projetSchema } from '../../types/form';
import type { ProjetFormData } from '../../types/form';
import { GRANT_PROGRAMS, findProgram } from '../../config/programs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Lightbulb, ArrowRight, ArrowLeft, Calendar, FileText, Sparkles } from 'lucide-react';

interface Step2Props {
  initialData?: Partial<ProjetFormData>;
  onNext: (data: ProjetFormData) => void;
  onPrev: () => void;
}

export const Step2Project: React.FC<Step2Props> = ({ initialData, onNext, onPrev }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjetFormData>({
    resolver: zodResolver(projetSchema),
    defaultValues: {
      objet_projet: initialData?.objet_projet || '',
      description: initialData?.description || '',
      date_debut: initialData?.date_debut || '',
      date_fin: initialData?.date_fin || '',
      programme_id: initialData?.programme_id || (GRANT_PROGRAMS[0]?.id || '')
    }
  });

  const selectedProgId = watch('programme_id');
  const selectedProg = findProgram(selectedProgId) || GRANT_PROGRAMS[0];

  const handlePrefillDemo = () => {
    setValue('objet_projet', 'Plateforme Algorithmique & R&D Industrielle IA');
    setValue(
      'description',
      'Développement expérimental et intégration de modèles d\'intelligence artificielle embarqués sur serveurs GPU haute performance pour l\'optimisation des rendements industriels au Maroc.'
    );
    setValue('date_debut', '2026-10-01');
    setValue('date_fin', '2027-09-30');
    setValue('programme_id', 'prog-tatwir-rd');
  };

  const programOptions = GRANT_PROGRAMS.map((prog) => ({
    value: prog.id,
    label: `${prog.nom} (${prog.categorie})`
  }));

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Étape 2 sur 5</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-brand-600" />
            Description du projet
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Présentez la nature, les objectifs et le calendrier d'exécution de votre action.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-brand-300 bg-brand-50/70 hover:bg-brand-100 text-brand-700 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
          title="Préremplir avec un exemple de projet d'inclusion"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Remplir exemple démo</span>
        </button>
      </div>

      {/* Détails du projet */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-brand-600" />
          Cadre de l'intervention
        </h3>

        <Select
          label="Programme ou dispositif visé"
          required
          options={programOptions}
          error={errors.programme_id?.message}
          {...register('programme_id')}
        />

        {selectedProg && (
          <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{selectedProg.nom}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-brand-100 text-brand-800 border border-brand-300">
                  {selectedProg.categorie}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedProg.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedProg.status === 'ACTIVE' ? 'Programme Actif' : 'Éditions Clôturées (Historique)'}
                </span>
                <span className="font-bold text-brand-900 text-xs">
                  Plafond : {selectedProg.plafond_indicatif.toLocaleString('fr-FR')} DH
                </span>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed text-xs">
              {selectedProg.description}
            </p>

            {selectedProg.requirements && selectedProg.requirements.length > 0 && (
              <div className="pt-2 border-t border-brand-200/60 space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px] block">
                  Pièces justificatives exigées ({selectedProg.requirements.length} documents) :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedProg.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-brand-100 text-[11px]"
                    >
                      <span className="text-slate-700 truncate">{req.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {req.mandatory ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Obligatoire
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Facultatif
                          </span>
                        )}
                        {req.validity_required && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="Doit être en cours de validité">
                            Validité requise
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Input
          label="Objet / Titre du projet"
          placeholder="Ex : Création d'une recyclerie solidaire et ateliers de réparation"
          required
          error={errors.objet_projet?.message}
          {...register('objet_projet')}
        />

        {/* Textarea Description */}
        <div className="w-full space-y-1.5">
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
            Description détaillée des actions et impacts attendus
            <span className="text-rose-500 ml-1" aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Détaillez les objectifs poursuivis, les bénéficiaires visés, la méthodologie mise en œuvre et les résultats mesurables attendus..."
            className={`block w-full rounded-lg border text-sm transition-colors p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              errors.description
                ? 'border-rose-300 bg-rose-50/30 text-rose-900'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs font-medium text-rose-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-brand-600" />
          Calendrier prévisionnel de réalisation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Date de début prévisionnelle"
            type="date"
            required
            error={errors.date_debut?.message}
            {...register('date_debut')}
          />

          <Input
            label="Date de fin prévisionnelle"
            type="date"
            required
            error={errors.date_fin?.message}
            {...register('date_fin')}
          />
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
          Retour au demandeur
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continuer vers le Budget
        </Button>
      </div>
    </form>
  );
};
