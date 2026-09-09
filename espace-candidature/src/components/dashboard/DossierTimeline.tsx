import React from 'react';
import type { DossierStatus } from '../../types/auth';
import { Check, AlertTriangle, XCircle, Award } from 'lucide-react';
import { KhatemSeal, useMoroccanTheme } from '../moroccan/MoroccanPatterns';

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
  const { primaryColor } = useMoroccanTheme();

  const steps = [
    {
      id: 1,
      name: 'Dépôt du dossier',
      detail: new Date(dateSoumission).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      state: 'done' as const
    },
    {
      id: 2,
      name: 'Vérification des pièces',
      detail:
        statut === 'documents_manquants'
          ? 'Compléments requis à régulariser'
          : statut === 'en_attente'
          ? 'En attente d’attribution'
          : 'Toutes les pièces conformes',
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
          ? 'Examen approfondi par la commission'
          : statut === 'valide' || statut === 'refuse'
          ? 'Instruction finalisée'
          : 'Phase à venir',
      state:
        statut === 'en_cours_examen'
          ? ('active' as const)
          : statut === 'valide' || statut === 'refuse'
          ? ('done' as const)
          : ('upcoming' as const)
    },
    {
      id: 4,
      name: 'Décision de la commission (Place centrale)',
      detail:
        statut === 'valide'
          ? decisionDate
            ? `Subvention accordée le ${new Date(decisionDate).toLocaleDateString('fr-FR')}`
            : 'Subvention d’État octroyée'
          : statut === 'refuse'
          ? 'Dossier non retenu'
          : 'Notification finale officielle',
      state:
        statut === 'valide'
          ? ('success' as const)
          : statut === 'refuse'
          ? ('danger' as const)
          : ('upcoming' as const)
    }
  ];

  return (
    <div className="bg-sand-50 rounded-2xl border border-sand-300 p-6 shadow-card space-y-6 text-left relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <KhatemSeal size={18} strokeWidth={1.5} />
            <h2 className="text-base font-bold text-indigo-950 font-display sm:text-lg">
              Progression de l’Instruction
            </h2>
          </div>
          <p className="text-xs text-sand-500 mt-0.5">
            Fil conducteur officiel menant de la vérification préalable à la commission d'octroi.
          </p>
        </div>
      </div>

      {/* Ruelle de Médina : Parcours menant à la décision centrale */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Ligne directrice en cuivre/sable */}
          <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-sand-300 -z-0" />

          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col sm:items-center text-left sm:text-center space-y-2">
              <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                {/* Pastille Zellige émaillée */}
                {s.state === 'done' && (
                  <div className="w-10 h-10 rounded-lg rotate-45 bg-emerald-700 text-white flex items-center justify-center shadow-zellige">
                    <Check className="w-5 h-5 text-gold-200 -rotate-45 stroke-[3]" />
                  </div>
                )}
                {s.state === 'warning' && (
                  <div className="w-10 h-10 rounded-xl bg-gold-500 text-white flex items-center justify-center animate-bounce shadow-md shadow-gold-900/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                {s.state === 'active' && (
                  <div
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md ring-4 ring-gold-200/80"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  </div>
                )}
                {s.state === 'success' && (
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md ring-4 ring-emerald-200">
                    <Award className="w-5 h-5 text-gold-300" />
                  </div>
                )}
                {s.state === 'danger' && (
                  <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center shadow-md">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                {s.state === 'upcoming' && (
                  <div className="w-10 h-10 rounded-xl bg-white border border-sand-300 text-sand-400 flex items-center justify-center text-xs font-bold">
                    {s.id}
                  </div>
                )}

                <div className="pt-1">
                  <h3 className="text-xs font-bold text-indigo-950">{s.name}</h3>
                  <p className="text-[11px] text-sand-500 mt-0.5">{s.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
