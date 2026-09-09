import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DossierState, DemandeurFormData, ProjetFormData, BudgetFormData } from '../types/form';
import type { ProcessedDocument, DocumentType } from '../types/ocr';
import type { WebhookDossierPayload } from '../types/webhook';
import { processFileOcr, fileToBase64 } from '../services/ocrService';
import { sendDossierToWebhook } from '../services/webhookService';
import { MOCK_CANDIDATES } from '../config/mockCandidates';

export function useWizardForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand-1');

  const [dossier, setDossier] = useState<DossierState>({
    demandeur: {
      structure_type: 'association',
      nom_ou_raison_sociale: '',
      siret: '',
      secteur_activite: '',
      adresse: '',
      code_postal: '',
      ville: '',
      region: '',
      anciennete_annees: 3,
      nom_representant: '',
      prenom_representant: '',
      date_naissance_representant: '',
      cin_representant: '',
      email_representant: '',
      telephone_representant: ''
    },
    projet: {
      objet_projet: '',
      description: '',
      date_debut: '',
      date_fin: '',
      programme_id: 'prog-istitmar-tpe'
    },
    budget: {
      montant_total: 45000,
      montant_demande: 25000,
      depenses: [
        { id: uuidv4(), libelle: 'Frais de déploiement et matériel', montant: 25000 },
        { id: uuidv4(), libelle: 'Ressources humaines et formation', montant: 20000 }
      ],
      financements: [
        { id: uuidv4(), financeur: 'Subvention sollicitée', montant: 25000, statut: 'sollicite' },
        { id: uuidv4(), financeur: 'Fonds propres', montant: 20000, statut: 'acquis' }
      ]
    },
    pieces: [],
    certification_sur_honneur: false
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<{ message: string; statusCode?: number } | null>(null);
  const [confirmedPayload, setConfirmedPayload] = useState<WebhookDossierPayload | null>(null);

  // Step transitions
  const handleSelectCandidate = useCallback((candidateId: string) => {
    const cand = MOCK_CANDIDATES.find((c) => c.id === candidateId);
    if (!cand) return;
    setSelectedCandidateId(cand.id);
    setDossier((prev) => ({
      ...prev,
      demandeur: { ...cand.demandeur },
      projet: { ...cand.projet },
      budget: { ...cand.budget }
    }));
  }, []);

  const handleSaveDemandeur = (data: DemandeurFormData) => {
    setDossier((prev) => ({ ...prev, demandeur: data }));
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[0] = true;
      return next;
    });
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProjet = (data: ProjetFormData) => {
    setDossier((prev) => ({ ...prev, projet: data }));
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[1] = true;
      return next;
    });
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBudget = (data: BudgetFormData) => {
    setDossier((prev) => ({ ...prev, budget: data }));
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[2] = true;
      return next;
    });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedFromDocuments = () => {
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[3] = true;
      return next;
    });
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Traitement et ajout de fichiers
  const handleAddFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      const docId = uuidv4();

      // Encodage base64 immédiat en mémoire
      let base64Data = '';
      try {
        base64Data = await fileToBase64(file);
      } catch (err) {
        console.error('Erreur de conversion Base64 pour', file.name, err);
      }

      // Initialisation du document dans l'état avec statut "en_cours"
      const isCvMistake = file.name.includes('Erreur_CNI');
      const newDoc: ProcessedDocument = {
        id: docId,
        file: file,
        nom_fichier: file.name,
        taille: file.size,
        type_mime: file.type || 'application/octet-stream',
        type_declare: isCvMistake ? 'piece_identite' : 'autre',
        texte_ocr: '',
        champs_detectes: {},
        fichier_base64: base64Data,
        statut_ocr: 'en_cours',
        ocr_progression: 10
      };

      setDossier((prev) => ({
        ...prev,
        pieces: [...prev.pieces, newDoc]
      }));

      // Lancement de l'OCR en arrière-plan
      processFileOcr(file, (progress, _msg) => {
        setDossier((prev) => ({
          ...prev,
          pieces: prev.pieces.map((p) =>
            p.id === docId ? { ...p, ocr_progression: progress } : p
          )
        }));
      })
        .then((result) => {
          setDossier((prev) => ({
            ...prev,
            pieces: prev.pieces.map((p) => {
              if (p.id !== docId) return p;

              if (result.succes) {
                return {
                  ...p,
                  texte_ocr: result.texte,
                  champs_detectes: result.champs_detectes,
                  type_suggere_ocr: result.type_suggere,
                  // Pré-sélection automatique de l'étiquette suggérée
                  type_declare: result.type_suggere && result.type_suggere !== 'autre' ? result.type_suggere : p.type_declare,
                  statut_ocr: 'succes',
                  ocr_methode: result.methode,
                  ocr_progression: 100
                };
              } else {
                return {
                  ...p,
                  statut_ocr: 'echec',
                  message_erreur: result.erreur,
                  ocr_progression: 0
                };
              }
            })
          }));
        })
        .catch((err) => {
          console.error('Exception OCR inattendue', err);
          setDossier((prev) => ({
            ...prev,
            pieces: prev.pieces.map((p) =>
              p.id === docId
                ? { ...p, statut_ocr: 'echec', message_erreur: String(err) }
                : p
            )
          }));
        });
    }
  }, []);

  const handleUpdateDocumentType = (id: string, newType: DocumentType) => {
    setDossier((prev) => ({
      ...prev,
      pieces: prev.pieces.map((p) => (p.id === id ? { ...p, type_declare: newType } : p))
    }));
  };

  const handleUpdateDocumentText = (id: string, newText: string) => {
    setDossier((prev) => ({
      ...prev,
      pieces: prev.pieces.map((p) => (p.id === id ? { ...p, texte_ocr: newText } : p))
    }));
  };

  const handleRemoveDocument = (id: string) => {
    setDossier((prev) => ({
      ...prev,
      pieces: prev.pieces.filter((p) => p.id !== id)
    }));
  };

  const handleRetryOcr = (id: string) => {
    const doc = dossier.pieces.find((p) => p.id === id);
    if (!doc) return;

    setDossier((prev) => ({
      ...prev,
      pieces: prev.pieces.map((p) =>
        p.id === id ? { ...p, statut_ocr: 'en_cours', ocr_progression: 15 } : p
      )
    }));

    processFileOcr(doc.file, (progress) => {
      setDossier((prev) => ({
        ...prev,
        pieces: prev.pieces.map((p) =>
          p.id === id ? { ...p, ocr_progression: progress } : p
        )
      }));
    }).then((result) => {
      setDossier((prev) => ({
        ...prev,
        pieces: prev.pieces.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            texte_ocr: result.texte,
            champs_detectes: result.champs_detectes,
            type_suggere_ocr: result.type_suggere,
            type_declare: result.type_suggere || p.type_declare,
            statut_ocr: result.succes ? 'succes' : 'echec',
            ocr_methode: result.methode,
            ocr_progression: 100
          };
        })
      }));
    });
  };

  // Soumission finale vers le Webhook
  const handleSubmitDossier = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const dossierId = uuidv4();
    const submissionDate = new Date().toISOString();

    const payload: WebhookDossierPayload = {
      dossier_id: dossierId,
      date_soumission: submissionDate,
      demandeur: dossier.demandeur,
      projet: dossier.projet,
      budget: dossier.budget,
      pieces: dossier.pieces.map((p) => ({
        nom_fichier: p.nom_fichier,
        type_declare: p.type_declare,
        type_suggere_ocr: p.type_suggere_ocr,
        texte_ocr: p.texte_ocr,
        champs_detectes: p.champs_detectes,
        fichier_base64: p.fichier_base64,
        statut_ocr: p.statut_ocr
      })),
      certification_sur_honneur: true
    };

    const res = await sendDossierToWebhook(payload);

    setIsSubmitting(false);

    if (res.success) {
      setConfirmedPayload(payload);
    } else {
      setSubmissionError({
        message: res.message || 'Une erreur est survenue lors de la transmission du dossier.',
        statusCode: res.status
      });
    }
  };

  const handleReset = () => {
    setConfirmedPayload(null);
    setSubmissionError(null);
    setCurrentStep(1);
    setCompletedSteps([false, false, false, false, false]);
    setDossier({
      demandeur: {
        structure_type: 'association',
        nom_ou_raison_sociale: '',
        siret: '',
        secteur_activite: '',
        adresse: '',
        code_postal: '',
        ville: '',
        region: '',
        anciennete_annees: 3,
        nom_representant: '',
        prenom_representant: '',
        date_naissance_representant: '',
        cin_representant: '',
        email_representant: '',
        telephone_representant: ''
      },
      projet: {
        objet_projet: '',
        description: '',
        date_debut: '',
        date_fin: '',
        programme_id: 'FORSA-2025'
      },
      budget: {
        montant_total: 45000,
        montant_demande: 25000,
        depenses: [
          { id: uuidv4(), libelle: 'Frais de déploiement et matériel', montant: 25000 },
          { id: uuidv4(), libelle: 'Ressources humaines et formation', montant: 20000 }
        ],
        financements: [
          { id: uuidv4(), financeur: 'Subvention sollicitée', montant: 25000, statut: 'sollicite' },
          { id: uuidv4(), financeur: 'Fonds propres', montant: 20000, statut: 'acquis' }
        ]
      },
      pieces: [],
      certification_sur_honneur: false
    });
  };

  const handleSimulateSuccess = () => {
    const dossierId = uuidv4();
    const submissionDate = new Date().toISOString();

    const payload: WebhookDossierPayload = {
      dossier_id: dossierId,
      date_soumission: submissionDate,
      demandeur: dossier.demandeur,
      projet: dossier.projet,
      budget: dossier.budget,
      pieces: dossier.pieces.map((p) => ({
        nom_fichier: p.nom_fichier,
        type_declare: p.type_declare,
        type_suggere_ocr: p.type_suggere_ocr,
        texte_ocr: p.texte_ocr,
        champs_detectes: p.champs_detectes,
        fichier_base64: p.fichier_base64,
        statut_ocr: p.statut_ocr
      })),
      certification_sur_honneur: true
    };
    setConfirmedPayload(payload);
  };

  return {
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
    currentCandidate: MOCK_CANDIDATES.find((c) => c.id === selectedCandidateId) || MOCK_CANDIDATES[0]
  };
}
