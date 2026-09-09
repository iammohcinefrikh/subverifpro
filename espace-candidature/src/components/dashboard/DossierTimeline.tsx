import React from 'react';
import type { DossierStatus } from '../../types/auth';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface DossierTimelineProps {
  statut: DossierStatus;
  dateSoumission: string;
  decisionDate?: string;
}

export const DossierTimeline: React.FC<DossierTimelineProps> = ({
  statut,
  dateSoumission,
  decisionDate
}) => {
  // Mapping des 4 jalons
  // Étape 1 : Dossier déposé (toujours validé si le dossier existe)
  // Étape 2 : Vérification des pièces (si 'documents_manquants', bloqué/alerte ici. Si 'en_cours_examen' ou au-delà, validé)
  // Étape 3 : Examen & Instruction (si 'en_cours_examen', en cours. Si 'valide' ou 'refuse', validé)
  // Étape 4 : Décision finale (accordé ou refusé)

  const steps = [
    {
      id: 1,
      name: 'Dépôt du dossier',
      detail: new Date(dateSoumission).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      state: 'done' as const
    },
    {
      id: 2,
      name: 'Vérification des pièces',
      detail:
        statut === 'documents_manquants'
          ? 'Pièces manquantes à fournir'
          : statut === 'en_attente'
          ? 'En attente d\'attribution'
          : 'Pièces conformes',
      state:
        statut === 'documents_manquants'
          ? ('warning' as const)
          : statut === 'en_attente'
          ? ('active' as const)
          : ('done' as const)
    },
    {
      id: 3,
      name: 'Instruction & Examen',
      detail:
        statut === 'en_cours_examen'
          ? 'Examen par la commission'
          : statut === 'valide' || statut === 'refuse'
          ? 'Instruction finalisée'
          : 'À venir',
      state:
        statut === 'en_cours_examen'
          ? ('active' as const)
          : statut === 'valide' || statut === 'refuse'
          ? ('done' as const)
          : ('upcoming' as const)
    },
    {
      id: 4,
      name: 'Décision finale',
      detail:
        statut === 'valide'
          ? decisionDate
            ? `Accordé le ${new Date(decisionDate).toLocaleDateString('fr-FR')}`
            : 'Subvention octroyée'
          : statut === 'refuse'
          ? 'Non retenu'
          : 'Notification finale',
      state:
        statut === 'valide'
          ? ('success' as const)
          : statut === 'refuse'
          ? ('danger' as const)
          : ('upcoming' as const)
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Progression de l'instruction
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des jalons administratifs et techniques de votre demande.
          </p>
        </div>
      </div>

      {/* Stepper Timeline Bar */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Background progress bar connector on desktop */}
          <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col sm:items-center text-left sm:text-center space-y-2">
              {/* Step Circle */}
              <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                {s.state === 'done' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {s.state === 'warning' && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center animate-bounce shadow-md shadow-amber-200">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {s.state === 'active' && (
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center ring-4 ring-brand-100 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
                {s.state === 'success' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-emerald-100 shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {s.state === 'danger' && (
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
                {s.state === 'upcoming' && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-bold">
                    {s.id}
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold text-slate-900">{s.name}</h3>
                  <p className="text-[11px] text-slate-500">{s.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
