import React from 'react';
import { Check, Building2, Lightbulb, Calculator, FileText, Send } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
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
      subtitle: 'Dépenses & financement',
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
    <nav aria-label="Progression du formulaire" className="w-full bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-card no-print">
      {/* Mobile view */}
      <div className="flex sm:hidden items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Étape {currentStep} sur {totalSteps}
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            {steps[currentStep - 1]?.title}
          </h2>
        </div>
        <div className="flex gap-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                step.id === currentStep
                  ? 'w-6 bg-brand-600'
                  : step.id < currentStep
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop view */}
      <ol className="hidden sm:grid grid-cols-5 gap-2 relative">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep || completedSteps[step.id - 1];
          const isCurrent = step.id === currentStep;
          const isAccessible = step.id <= currentStep || completedSteps[step.id - 2];

          return (
            <li key={step.id} className="relative flex flex-col items-center text-center group">
              <button
                type="button"
                onClick={() => isAccessible && onStepClick && onStepClick(step.id)}
                disabled={!isAccessible}
                className={`flex flex-col items-center w-full focus:outline-none transition-all ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                {/* Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2 text-sm font-bold mb-2 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20'
                      : isCurrent
                      ? 'bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100 shadow-brand-600/20'
                      : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.icon}
                </div>

                {/* Text */}
                <span
                  className={`text-xs font-bold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-brand-700'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[11px] text-slate-400 font-normal hidden lg:block">
                  {step.subtitle}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
