import React from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Wizard Stepper */}
      <Stepper
        currentStep={currentStep}
        totalSteps={5}
        onStepClick={handleJumpToStep}
        completedSteps={completedSteps}
      />

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
