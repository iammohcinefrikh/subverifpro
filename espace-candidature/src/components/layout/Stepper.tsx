import React from 'react';
import { Check, Building2, Lightbulb, Calculator, FileText, Send } from 'lucide-react';
import { useMoroccanTheme } from '../moroccan/MoroccanPatterns';

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  completedSteps?: boolean[];
}

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps = 5,
  onStepClick,
  completedSteps = []
}) => {
  const { primaryColor } = useMoroccanTheme();

  const steps: StepItem[] = [
    {
      id: 1,
      title: 'Profil demandeur',
      subtitle: 'Identité & structure',
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 2,
      title: 'Projet',
      subtitle: 'Descriptif & calendrier',
      icon: <Lightbulb className="w-4 h-4" />
    },
    {
      id: 3,
      title: 'Budget',
      subtitle: 'Dépenses & plan',
      icon: <Calculator className="w-4 h-4" />
    },
    {
      id: 4,
      title: 'Pièces & OCR',
      subtitle: 'Dépôt & extraction',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 5,
      title: 'Récapitulatif',
      subtitle: 'Certification & envoi',
      icon: <Send className="w-4 h-4" />
    }
  ];

  return (
    <nav
      aria-label="Progression du dossier de candidature"
      className="w-full bg-sand-50/90 backdrop-blur-sm rounded-2xl border border-sand-300 p-4 sm:p-5 shadow-card no-print relative overflow-hidden"
    >
      {/* Mobile view */}
      <div className="flex sm:hidden items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-terracotta-600 uppercase tracking-wider" style={{ color: primaryColor }}>
            Module {currentStep} sur {totalSteps}
          </span>
          <h2 className="text-base font-bold text-indigo-950 mt-0.5">
            {steps[currentStep - 1]?.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep || completedSteps[step.id - 1];
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick && onStepClick(step.id)}
                title={`Aller à l'étape ${step.id}: ${step.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isCurrent
                    ? 'w-6 h-2.5 bg-terracotta-500 shadow-sm'
                    : isCompleted
                    ? 'w-2.5 h-2.5 bg-emerald-600 hover:scale-125'
                    : 'w-2.5 h-2.5 bg-sand-300 hover:scale-125'
                }`}
                style={isCurrent ? { backgroundColor: primaryColor } : {}}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop view — Module Zellige & Frise d'assemblage */}
      <div className="hidden sm:block relative">
        {/* Ligne directrice de raccordement façon pavage */}
        <div
          className="absolute top-5 left-8 right-8 h-0.5 -translate-y-1/2 z-0 pointer-events-none"
          style={{
            background: `linear-gradient(to right, #0E5E4B ${((currentStep - 1) / (totalSteps - 1)) * 100}%, #E5D5B7 ${((currentStep - 1) / (totalSteps - 1)) * 100}%)`,
          }}
        />

        <ol className="grid grid-cols-5 gap-2 relative z-10">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep || completedSteps[step.id - 1];
            const isCurrent = step.id === currentStep;

            return (
              <li key={step.id} className="relative flex flex-col items-center text-center group">
                <button
                  type="button"
                  onClick={() => onStepClick && onStepClick(step.id)}
                  title={`Cliquer pour aller à l'étape ${step.id} : ${step.title}`}
                  className="flex flex-col items-center w-full focus:outline-none transition-all cursor-pointer hover:scale-102"
                >
                  {/* Module géométrique (Étoile / Module scellé) */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center transition-all duration-300 text-sm font-bold mb-2 shadow-sm relative ${
                      isCompleted
                        ? 'bg-emerald-600 text-white rounded-lg rotate-45 shadow-zellige'
                        : isCurrent
                        ? 'bg-terracotta-500 text-white rounded-xl shadow-md ring-4 ring-gold-300/60 scale-105'
                        : 'bg-white border-2 border-sand-300 text-sand-500 rounded-xl group-hover:border-gold-400'
                    }`}
                    style={isCurrent ? { backgroundColor: primaryColor } : {}}
                  >
                    <div className={isCompleted ? '-rotate-45 flex items-center justify-center' : 'flex items-center justify-center'}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-gold-200 stroke-[3]" />
                      ) : (
                        step.icon
                      )}
                    </div>
                  </div>

                  {/* Libellé & sous-titre */}
                  <span
                    className={`text-xs font-bold tracking-tight transition-colors ${
                      isCurrent
                        ? 'text-indigo-950 font-extrabold'
                        : isCompleted
                        ? 'text-emerald-800'
                        : 'text-sand-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[11px] text-sand-500 font-normal hidden lg:block">
                    {step.subtitle}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
