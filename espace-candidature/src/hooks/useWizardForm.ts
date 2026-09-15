import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DossierState, DemandeurFormData, ProjetFormData, BudgetFormData } from '../types/form';
import type { ProcessedDocument, DocumentType } from '../types/ocr';
import type { WebhookDossierPayload } from '../types/webhook';
import type { MockCandidateUser } from '../types/auth';
import { processFileOcr, fileToBase64 } from '../services/ocrService';
import { sendDossierToWebhook } from '../services/webhookService';
import { MOCK_CANDIDATES } from '../config/mockCandidates';

export function useWizardForm(initialUser?: MockCandidateUser | null) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand-1');

  const isUuid = (str: any) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  // Maintien strict de l'identifiant application_id : immuable pour un candidat donné
  const fixedApplicationId =
    (initialUser?.application_id && isUuid(initialUser.application_id) ? initialUser.application_id : null) ||
    (initialUser?.dossier?.application_id && isUuid(initialUser.dossier.application_id) ? initialUser.dossier.application_id : null) ||
    (initialUser?.dossier?.dossier_id && isUuid(initialUser.dossier.dossier_id) ? initialUser.dossier.dossier_id : null) ||
    null;

  const isDossierExisting = !!(
    initialUser?.hasSubmittedDossier ||
    fixedApplicationId ||
    (initialUser?.dossier?.pieces && initialUser.dossier.pieces.length > 0)
  );

  const [dossier, setDossier] = useState<DossierState>(() => {
    if (initialUser && (initialUser.hasSubmittedDossier || initialUser.dossier?.pieces?.length > 0 || initialUser.demandeur?.email_representant)) {
      return {
        demandeur: { ...initialUser.demandeur },
        projet: { ...initialUser.projet },
        budget: { ...initialUser.budget },
        pieces: (initialUser.dossier?.pieces || []).map((p) => ({
          id: (p as any).id || uuidv4(),
          file: null as any,
          nom_fichier: p.nom_fichier || 'document.pdf',
          taille: 0,
          type_mime: 'application/pdf',
          type_declare: p.type_declare,
          type_suggere_ocr: p.type_suggere_ocr,
          texte_ocr: p.texte_ocr || '',
          champs_detectes: p.champs_detectes || {},
          fichier_base64: p.fichier_base64 || '',
          statut_ocr: (p.statut_ocr as any) || 'succes',
          ocr_progression: 100
        })),
        certification_sur_honneur: false
      };
    }

    return {
      demandeur: {
        structure_type: 'entreprise',
        nom_ou_raison_sociale: '',
        siret: '',
        secteur_activite: '',
        adresse: '',
        code_postal: '',
        ville: '',
        region: '',
        anciennete_annees: 1,
        nom_representant: '',
        prenom_representant: '',
        date_naissance_representant: '',
        cin_representant: '',
        email_representant: '',
        telephone_representant: ''
      },
      projet: {
        programme_id: 'prog-tamwil-crea',
        objet_projet: '',
        description: '',
        date_debut: '',
        date_fin: ''
      },
      budget: {
        montant_total: 0,
        montant_demande: 0,
        depenses: [
          {
            id: uuidv4(),
            libelle: 'Équipements et matériel principal',
            montant: 0
          }
        ],
        financements: [
          {
            id: uuidv4(),
            financeur: 'Subvention sollicitée',
            montant: 0,
            statut: 'sollicite'
          }
        ]
      },
      pieces: [],
      certification_sur_honneur: false
    };
  });

  // Synchronisation dynamique si initialUser arrive après le premier rendu
  useEffect(() => {
    if (initialUser) {
      setDossier((prev) => {
        const hasExisting = prev.demandeur.email_representant && prev.demandeur.email_representant.trim().length > 0;
        if (hasExisting && prev.pieces.length > 0) return prev;

        return {
          ...prev,
          demandeur: {
            ...prev.demandeur,
            ...initialUser.demandeur,
            email_representant: initialUser.demandeur?.email_representant || initialUser.email,
            nom_ou_raison_sociale: initialUser.demandeur?.nom_ou_raison_sociale || initialUser.structureNom,
            prenom_representant: initialUser.demandeur?.prenom_representant || initialUser.nomCourt?.split(' ')[0] || '',
            nom_representant: initialUser.demandeur?.nom_representant || initialUser.nomCourt?.split(' ').slice(1).join(' ') || ''
          },
          projet: {
            ...prev.projet,
            ...(initialUser.projet?.objet_projet ? initialUser.projet : {})
          },
          budget: {
            ...prev.budget,
            ...(initialUser.budget?.montant_demande ? initialUser.budget : {})
          },
          pieces: prev.pieces.length > 0 ? prev.pieces : (initialUser.dossier?.pieces || []).map((p) => ({
            id: (p as any).id || uuidv4(),
            file: null as any,
            nom_fichier: p.nom_fichier || 'document.pdf',
            taille: 0,
            type_mime: 'application/pdf',
            type_declare: p.type_declare,
            type_suggere_ocr: p.type_suggere_ocr,
            texte_ocr: p.texte_ocr || '',
            champs_detectes: p.champs_detectes || {},
            fichier_base64: p.fichier_base64 || '',
            statut_ocr: (p.statut_ocr as any) || 'succes',
            ocr_progression: 100
          }))
        };
      });
    }
  }, [initialUser]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
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
    // Verrouillage atomique synchrone : empêche formellement tout double envoi au webhook
    if (isSubmittingRef.current) {
      console.warn('[useWizardForm] Soumission déjà en cours. Requête doublon bloquée.');
      return null;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Maintien strict de l'identifiant application_id : immuable pour un candidat donné
      const targetApplicationId = fixedApplicationId || uuidv4();
      const submissionDate = new Date().toISOString();

      const payload: WebhookDossierPayload = {
        application_id: targetApplicationId,
        dossier_id: targetApplicationId,
        is_update: isDossierExisting,
        date_soumission: submissionDate,
        demandeur: dossier.demandeur,
        projet: dossier.projet,
        budget: dossier.budget,
        pieces: dossier.pieces.map((p) => {
          const cleanName = p.nom_fichier.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storagePath = `applications/${targetApplicationId}/${p.type_declare}_${cleanName}`;
          return {
            nom_fichier: p.nom_fichier,
            type_declare: p.type_declare,
            type_suggere_ocr: p.type_suggere_ocr,
            texte_ocr: p.texte_ocr,
            champs_detectes: p.champs_detectes,
            fichier_base64: p.fichier_base64,
            statut_ocr: p.statut_ocr,
            taille: p.taille,
            storage_path: storagePath,
            url: `https://mtbtvivmdfrrujehkpvx.supabase.co/storage/v1/object/public/application-documents/${storagePath}`
          };
        }),
        certification_sur_honneur: true
      };

      // 1. Envoi au webhook de vérification (déclenche le cycle complet d'évaluation G1->G2->G3->G4)
      const res = await sendDossierToWebhook(payload);

      // 2. Synchronisation de la table public.applications : réinitialisation du statut pour réévaluation
      try {
        await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            application_id: targetApplicationId,
            candidate_id: initialUser?.id || null,
            email: dossier.demandeur.email_representant,
            cin: dossier.demandeur.cin_representant,
            program_id: dossier.projet.programme_id,
            status: 'SUBMITTED', // Flux de traitement : repasse par le processus global d'évaluation
            compliance_rate: 0,
            documents: payload.pieces,
            total_amount: dossier.budget.montant_total,
            requested_amount: dossier.budget.montant_demande,
            depenses: dossier.budget.depenses,
            financements: dossier.budget.financements,
            project_object: dossier.projet.objet_projet,
            project_description: dossier.projet.description,
            submitted_at: submissionDate
          })
        });
      } catch (apiErr) {
        console.warn('[WizardForm] Erreur synchronisation API applications:', apiErr);
      }

      if (res.success) {
        setConfirmedPayload(payload);
        return payload;
      } else {
        setSubmissionError({
          message: res.message || 'Une erreur est survenue lors de la transmission du dossier.',
          statusCode: res.status
        });
        return null;
      }
    } catch (err: any) {
      console.error('[WizardForm] Exception lors de la soumission du dossier:', err);
      setSubmissionError({
        message: err?.message || 'Une erreur inattendue est survenue lors de la transmission.'
      });
      return null;
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
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
    const targetApplicationId = fixedApplicationId || uuidv4();
    const submissionDate = new Date().toISOString();

    const payload: WebhookDossierPayload = {
      application_id: targetApplicationId,
      dossier_id: targetApplicationId,
      is_update: isDossierExisting,
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
    return payload;
  };

  return {
    currentStep,
    completedSteps,
    dossier,
    isSubmitting,
    submissionError,
    confirmedPayload,
    isUpdate: isDossierExisting,
    applicationId: fixedApplicationId,
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
