import React from 'react';
import { FileEdit, ScanSearch, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ProcessStepsSection: React.FC = () => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Saisie du projet & budget',
      description: 'Renseignez l\'identité de votre structure, la description de votre initiative et la décomposition financière de vos dépenses.',
      icon: <FileEdit className="w-5 h-5 text-brand-600" />,
      badge: 'Formulaire guidé'
    },
    {
      stepNumber: '02',
      title: 'Reconnaissance OCR locale',
      description: 'Déposez vos pièces (RIB, devis, statuts, identité). Les données clés sont extraites localement dans votre navigateur sans transfert préalable.',
      icon: <ScanSearch className="w-5 h-5 text-brand-600" />,
      badge: 'Zero-cloud local'
    },
    {
      stepNumber: '03',
      title: 'Transmission & Récépissé',
      description: 'Votre dossier complet est chiffré et transmis avec génération instantanée d\'un récépissé officiel doté d\'un identifiant unique de suivi.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      badge: 'Horodatage certifié'
    },
    {
      stepNumber: '04',
      title: 'Suivi & Complément en ligne',
      description: 'Consultez la timeline d\'instruction sur votre espace candidat. En cas de pièce manquante, régularisez-la en quelques secondes.',
      icon: <CheckCircle2 className="w-5 h-5 text-brand-600" />,
      badge: 'Espace candidat'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block">
            Procédure Simplifiée
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comment fonctionne SubVerif ?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Un guichet moderne et décentralisé conçu pour réduire les délais d'instruction et supprimer les rejets pour pièces illisibles ou manquantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="group relative bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-brand-300 transition-all duration-300 hover:shadow-card hover:-translate-y-1 text-left flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-200/70 text-slate-700 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    {step.stepNumber}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-subtle">
                    {step.icon}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60">
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-brand-600 transition-colors">
                  {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
