import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Stepper } from '../components/layout/Stepper';
import { Step1Applicant } from '../components/steps/Step1Applicant';
import { Step2Project } from '../components/steps/Step2Project';
import { Step3Budget } from '../components/steps/Step3Budget';
import { Step4Documents } from '../components/steps/Step4Documents';
import { Step5Summary } from '../components/steps/Step5Summary';
import { ConfirmationModal } from '../components/feedback/ConfirmationModal';
import { useWizardForm } from '../hooks/useWizardForm';
import { useAuth } from '../context/useAuth';
import { registerWizardSubmissionAsCandidate } from '../services/mockAuthService';
import { MOCK_CANDIDATES } from '../config/mockCandidates';
import { ZelligePattern, useMoroccanTheme } from '../components/moroccan/MoroccanPatterns';

const STEP_CONFIG = [
  { id: 1, title: 'Profil demandeur', nextLabel: 'le Projet' },
  { id: 2, title: 'Projet', nextLabel: 'le Budget' },
  { id: 3, title: 'Budget', nextLabel: 'les Pièces & OCR' },
  { id: 4, title: 'Pièces & OCR', nextLabel: 'le Récapitulatif' },
  { id: 5, title: 'Récapitulatif & Soumission', nextLabel: 'la transmission' }
];

export const WizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginAsDemo, refreshUser, isAuthenticated } = useAuth();

  // Le candidat doit obligatoirement s'identifier avant de déposer son dossier
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    currentStep,
    completedSteps,
    dossier,
    isSubmitting,
    submissionError,
    confirmedPayload,
    handleSaveDemandeur,
    handleSaveProjet,
    handleSaveBudget,
    handleProceedFromDocuments,
    handleJumpToStep,
    handleAddFiles,
    handleUpdateDocumentType,
    handleUpdateDocumentText,
    handleRemoveDocument,
    handleRetryOcr,
    handleSubmitDossier,
    handleSimulateSuccess,
    handleReset,
    selectedCandidateId,
    handleSelectCandidate,
    currentCandidate
  } = useWizardForm();

  // Si le candidat connecté correspond à un profil mocké, synchroniser le dossier
  const hasInitializedCandidate = React.useRef(false);
  React.useEffect(() => {
    if (user && !hasInitializedCandidate.current) {
      const match = MOCK_CANDIDATES.find(
        (c) => c.id === user.id || c.demandeur.email_representant.toLowerCase() === user.email.toLowerCase()
      );
      if (match) {
        handleSelectCandidate(match.id);
        hasInitializedCandidate.current = true;
      }
    }
  }, [user, handleSelectCandidate]);

  // Si le candidat est connecté, pré-remplir les données de l'étape 1 avec son compte
  const demandeurInitialData = React.useMemo(() => {
    if (!user) return dossier.demandeur;
    return {
      ...dossier.demandeur,
      nom_ou_raison_sociale: dossier.demandeur.nom_ou_raison_sociale || user.structureNom,
      prenom_representant: dossier.demandeur.prenom_representant || user.demandeur.prenom_representant,
      nom_representant: dossier.demandeur.nom_representant || user.demandeur.nom_representant,
      email_representant: dossier.demandeur.email_representant || user.email
    };
  }, [dossier.demandeur, user]);

  // Si le dossier a été soumis avec succès vers le webhook
  if (confirmedPayload) {
    const handleGoToDashboard = () => {
      const candidateUser = registerWizardSubmissionAsCandidate(confirmedPayload);
      refreshUser();
      loginAsDemo(candidateUser.id);
      navigate('/dashboard');
    };

    return (
      <ConfirmationModal
        payload={confirmedPayload}
        onReset={handleReset}
        onGoToDashboard={handleGoToDashboard}
      />
    );
  }

  const { primaryColor } = useMoroccanTheme();
  const currentStepConfig = STEP_CONFIG[currentStep - 1] || STEP_CONFIG[0];
  const nextStepConfig = STEP_CONFIG[currentStep] || null;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 relative">
      <ZelligePattern id="zel-wizard" color={primaryColor} opacity={0.03} />

      {/* Wizard Stepper */}
      <Stepper
        currentStep={currentStep}
        totalSteps={5}
        onStepClick={handleJumpToStep}
        completedSteps={completedSteps}
      />

      {/* Barre d'action rapide haute (immédiatement visible sous le Stepper) */}
      <div className="bg-sand-50/90 backdrop-blur-sm rounded-xl border border-sand-300 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-extrabold text-white shadow-xs tracking-wider uppercase"
            style={{ backgroundColor: primaryColor }}
          >
            Étape {currentStep} / 5
          </span>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-indigo-950 leading-tight">
              {currentStepConfig.title}
            </h1>
            <p className="text-[11px] text-sand-600 mt-0.5">
              {currentStep < 5
                ? `Suivant : ${nextStepConfig?.title}`
                : 'Dernière étape avant la soumission'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => handleJumpToStep(currentStep - 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sand-700 hover:text-indigo-950 bg-white hover:bg-sand-100 rounded-lg transition-colors cursor-pointer border border-sand-300 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type={currentStep === 4 ? 'button' : 'submit'}
              form={currentStep === 4 ? undefined : 'wizard-active-form'}
              onClick={currentStep === 4 ? handleProceedFromDocuments : undefined}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-bold text-white rounded-lg shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer ring-2 ring-terracotta-400/30"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Étape suivante →</span>
            </button>
          ) : (
            <button
              type="submit"
              form="wizard-active-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-400/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmission...</span>
                </>
              ) : (
                <>
                  <span>Soumettre le dossier</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="transition-all duration-300">
        {currentStep === 1 && (
          <Step1Applicant
            initialData={demandeurInitialData}
            onNext={handleSaveDemandeur}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={handleSelectCandidate}
          />
        )}

        {currentStep === 2 && (
          <Step2Project
            initialData={dossier.projet}
            onNext={handleSaveProjet}
            onPrev={() => handleJumpToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Budget
            initialData={dossier.budget}
            onNext={handleSaveBudget}
            onPrev={() => handleJumpToStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Documents
            documents={dossier.pieces}
            currentCandidate={currentCandidate}
            programmeId={dossier.projet.programme_id}
            onAddFiles={handleAddFiles}
            onUpdateType={handleUpdateDocumentType}
            onUpdateText={handleUpdateDocumentText}
            onRemove={handleRemoveDocument}
            onRetry={handleRetryOcr}
            onNext={handleProceedFromDocuments}
            onPrev={() => handleJumpToStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Summary
            dossier={dossier}
            onJumpToStep={handleJumpToStep}
            onSubmitDossier={handleSubmitDossier}
            onSimulateSuccess={handleSimulateSuccess}
            onPrev={() => handleJumpToStep(4)}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
            onRetry={handleSubmitDossier}
          />
        )}
      </div>
    </div>
  );
};
