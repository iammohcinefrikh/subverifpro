import React, { useState } from 'react';
import type { MockCandidateUser } from '../../types/auth';
import type { ProcessedDocument, DocumentType } from '../../types/ocr';
import type { WebhookPiecePayload, WebhookComplementPayload } from '../../types/webhook';
import { DropZone } from '../documents/DropZone';
import { DocumentCard } from '../documents/DocumentCard';
import { Button } from '../ui/Button';
import { processFileOcr, fileToBase64 } from '../../services/ocrService';
import { sendComplementToWebhook } from '../../services/webhookService';
import { addComplementPiecesToDossier } from '../../services/mockAuthService';
import { saveComplianceCheckToDb } from '../../services/complianceCheckService';
import { generateSyntheticDocument } from '../../services/syntheticDocumentGenerator';
import { getDocumentTypeDefinition } from '../../config/documentTypes';
import {
  AlertTriangle,
  FileWarning,
  Sparkles,
  Send,
  CheckCircle2,
  Loader2,
  Info
} from 'lucide-react';

interface MissingDocumentsCardProps {
  user: MockCandidateUser;
  onDossierUpdated: () => void;
}

export const MissingDocumentsCard: React.FC<MissingDocumentsCardProps> = ({
  user,
  onDossierUpdated
}) => {
  const [newDocuments, setNewDocuments] = useState<ProcessedDocument[]>([]);
  const [candidateRemarks, setCandidateRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Identifier précisément les pièces manquantes
  const existingTypes = new Set(user.dossier.pieces.map((p) => p.type_declare));
  const missingTypes = user.dossier.pieces_requises.filter(
    (reqType) => !existingTypes.has(reqType)
  );

  // Fichiers déjà ajoutés dans la session courante
  const addedTypes = new Set(newDocuments.map((d) => d.type_declare));
  const remainingToUpload = missingTypes.filter((t) => !addedTypes.has(t));

  const isAnyOcrPending = newDocuments.some((d) => d.statut_ocr === 'en_cours');

  /**
   * Traitement et extraction OCR locale lors de l'ajout de fichiers
   */
  const handleAddFiles = async (files: File[]) => {
    setSubmitError(null);

    const pendingDocs: ProcessedDocument[] = files.map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      nom_fichier: file.name,
      taille: file.size,
      type_mime: file.type,
      type_declare: 'autre',
      texte_ocr: '',
      champs_detectes: {},
      fichier_base64: '',
      statut_ocr: 'en_cours',
      ocr_progression: 10
    }));

    setNewDocuments((prev) => [...prev, ...pendingDocs]);

    for (const doc of pendingDocs) {
      try {
        const base64 = await fileToBase64(doc.file);
        const ocrResult = await processFileOcr(doc.file, (progress) => {
          setNewDocuments((prev) =>
            prev.map((d) => (d.id === doc.id ? { ...d, ocr_progression: progress } : d))
          );
        });

        // Heuristique d'association si le type correspond à une pièce manquante
        let declaredType: DocumentType = ocrResult.type_suggere || 'autre';
        if (remainingToUpload.length > 0 && declaredType === 'autre') {
          declaredType = remainingToUpload[0];
        }

        setNewDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  statut_ocr: ocrResult.succes ? 'succes' : 'echec',
                  type_declare: declaredType,
                  type_suggere_ocr: ocrResult.type_suggere,
                  texte_ocr: ocrResult.texte,
                  champs_detectes: ocrResult.champs_detectes,
                  fichier_base64: base64,
                  ocr_methode: ocrResult.methode,
                  message_erreur: ocrResult.erreur
                }
              : d
          )
        );
      } catch (err: unknown) {
        setNewDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  statut_ocr: 'echec',
                  message_erreur: err instanceof Error ? err.message : 'Erreur OCR'
                }
              : d
          )
        );
      }
    }
  };

  /**
   * Génération en 1 clic d'une pièce synthétique conforme pour la démo
   */
  const handleGenerateMissing = async (docType: DocumentType) => {
    try {
      setGeneratingType(docType);
      const file = await generateSyntheticDocument(docType, {
        id: user.id,
        nomCourt: user.nomCourt,
        badge: user.badge,
        tagline: user.projet.objet_projet,
        demandeur: user.demandeur,
        projet: user.projet,
        budget: user.budget,
        syntheticDocs: {
          rib: {
            banque: 'ATTIJARIWAFA BANK',
            titulaire: user.demandeur.nom_ou_raison_sociale,
            ice: user.demandeur.siret,
            iban: 'MA64 0077 8000 0123 4567 8901 42',
            bic: 'BCMAMAMC',
            ville: user.demandeur.ville
          },
          devis: {
            fournisseur: 'FOURNISSEUR EQUIPEMENT SARL',
            iceFournisseur: '001987654000088',
            totalHT: 120000,
            tva: 24000,
            totalTTC: 144000,
            designation: 'Équipements et matériel d\'exploitation'
          },
          cnss: {
            numAffiliation: '7654321',
            cotisations: '24 500,00 MAD'
          }
        }
      });

      await handleAddFiles([file]);
    } catch (err) {
      console.error('Erreur génération pièce:', err);
    } finally {
      setGeneratingType(null);
    }
  };

  const handleUpdateType = (id: string, newType: DocumentType) => {
    setNewDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, type_declare: newType } : d))
    );
  };

  const handleUpdateText = (id: string, newText: string) => {
    setNewDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, texte_ocr: newText } : d))
    );
  };

  const handleRemove = (id: string) => {
    setNewDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRetry = (id: string) => {
    const doc = newDocuments.find((d) => d.id === id);
    if (doc) {
      handleAddFiles([doc.file]);
    }
  };

  /**
   * Envoi du complément au webhook et mise à jour du localStorage
   */
  const handleSubmitComplement = async () => {
    if (newDocuments.length === 0) {
      setSubmitError('Veuillez ajouter au moins une pièce justificative.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const piecesPayload: WebhookPiecePayload[] = newDocuments.map((d) => ({
      nom_fichier: d.nom_fichier,
      type_declare: d.type_declare,
      type_suggere_ocr: d.type_suggere_ocr,
      texte_ocr: d.texte_ocr,
      champs_detectes: d.champs_detectes,
      fichier_base64: d.fichier_base64,
      statut_ocr: d.statut_ocr
    }));

    const complementPayload: WebhookComplementPayload = {
      type: 'complement_pieces',
      dossier_id: user.dossier.dossier_id,
      date_transmission: new Date().toISOString(),
      demandeur_email: user.email,
      pieces_ajoutees: piecesPayload,
      statut_apres_envoi: 'en_cours_examen',
      remarques_candidat: candidateRemarks.trim() || undefined
    };

    try {
      // 1. Envoi au webhook externe
      await sendComplementToWebhook(complementPayload).catch((e) =>
        console.warn('Webhook warning:', e)
      );

      // 2. Mise à jour de la persistance locale (localStorage)
      const updatedUser = addComplementPiecesToDossier(
        user.id,
        piecesPayload,
        candidateRemarks || 'Pièces complémentaires transmises par le candidat'
      );

      // 3. Calcul précis des pièces et de l'exhaustivité
      const allPieces = updatedUser ? updatedUser.dossier.pieces : [...user.dossier.pieces, ...piecesPayload];
      const piecesRequises = user.dossier.pieces_requises || ['piece_identite', 'rib', 'devis', 'statuts'];
      const currentTypes = new Set(allPieces.map((p) => p.type_declare));
      const remainingMissing = piecesRequises.filter((req) => !currentTypes.has(req));
      const isComplete = remainingMissing.length === 0;

      const rate = piecesRequises.length > 0
        ? Math.min(100, Math.round(((piecesRequises.length - remainingMissing.length) / piecesRequises.length) * 100))
        : 100;

      // 4. Synchronisation avec PostgreSQL public.compliance_checks
      await saveComplianceCheckToDb({
        candidate_id: user.id,
        application_id: (user.dossier as any).db_application_id || user.dossier.dossier_id,
        program_id: user.projet.programme_id || 'prog-forsa',
        completeness_rate: rate,
        status: isComplete ? 'COMPLETE' : 'INCOMPLETE',
        mandatory_documents_count: piecesRequises.length,
        present_count: allPieces.length,
        missing_count: remainingMissing.length,
        expired_count: 0,
        present_documents: allPieces.map((p) => p.type_declare),
        missing_documents: remainingMissing.map((t) => ({
          type: t,
          document_type: t,
          status: 'MISSING'
        })),
        documents: allPieces.map((p) => ({
          type: p.type_declare,
          document_type: p.type_declare,
          nom_fichier: p.nom_fichier,
          status: 'PRESENT'
        }))
      });

      setSubmitSuccess(true);
      setNewDocuments([]);
      onDossierUpdated();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'Erreur lors de la transmission des pièces.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-left space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-base">
              Documents complémentaires transmis avec succès !
            </h3>
            <p className="text-xs text-emerald-700">
              Votre dossier est désormais complet et a été reclassé en <span className="font-bold">"En cours d'examen"</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-card">
      {/* En-tête d'alerte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-amber-200">
            <FileWarning className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block mb-1">
              Action requise du candidat
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pièces justificatives manquantes ou non conformes
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              L'instructeur a examiné votre dossier et requiert les pièces suivantes pour poursuivre la procédure :
            </p>
          </div>
        </div>
      </div>

      {/* Message de l'instructeur */}
      {user.dossier.remarques_instructeur && (
        <div className="bg-white rounded-xl p-4 border border-amber-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Info className="w-4 h-4 text-amber-600" />
            <span>Remarque de l'instructeur :</span>
          </div>
          <p className="italic text-slate-800 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
            « {user.dossier.remarques_instructeur} »
          </p>
        </div>
      )}

      {/* Liste précise des pièces manquantes avec bouton de génération démo */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Pièces requises à fournir ({missingTypes.length}) :
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {missingTypes.map((typeKey) => {
            const def = getDocumentTypeDefinition(typeKey);
            const isAdded = addedTypes.has(typeKey as DocumentType);

            return (
              <div
                key={typeKey}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isAdded
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-white border-amber-200 text-slate-900'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {isAdded ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="text-xs font-bold">{def?.label || typeKey}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {isAdded ? 'Pièce déposée et analysée' : 'En attente de téléversement'}
                  </p>
                </div>

                {/* Raccourci Démo : générer la pièce manquante en un clic */}
                {!isAdded && (
                  <button
                    type="button"
                    onClick={() => handleGenerateMissing(typeKey as DocumentType)}
                    disabled={generatingType === typeKey}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Générer un exemple officiel pour tester la régularisation en démo"
                  >
                    {generatingType === typeKey ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>Générer</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone de téléversement OCR (DropZone réutilisée) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Déposer les pièces complémentaires (OCR automatique) :
        </h3>

        <DropZone onFilesSelected={handleAddFiles} />
      </div>

      {/* Liste des documents nouvellement ajoutés */}
      {newDocuments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700">
            Pièces prêtes pour régularisation ({newDocuments.length}) :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onUpdateType={handleUpdateType}
                onUpdateText={handleUpdateText}
                onRemove={handleRemove}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </div>
      )}

      {/* Remarque optionnelle du candidat */}
      <div className="space-y-1.5">
        <label htmlFor="remarques" className="block text-xs font-bold text-slate-700">
          Message ou explication pour l'instructeur (optionnel) :
        </label>
        <textarea
          id="remarques"
          rows={2}
          value={candidateRemarks}
          onChange={(e) => setCandidateRemarks(e.target.value)}
          placeholder="Ex : Veuillez trouver ci-joint le RIB officiel certifié de notre compte courant..."
          className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Erreur de soumission */}
      {submitError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
          {submitError}
        </div>
      )}

      {/* Bouton de soumission des pièces */}
      <div className="pt-4 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-slate-500">
          Les pièces déposées seront immédiatement transmises et le statut passera à "En cours d'examen".
        </p>

        <Button
          type="button"
          variant="primary"
          onClick={handleSubmitComplement}
          disabled={newDocuments.length === 0 || isAnyOcrPending || isSubmitting}
          isLoading={isSubmitting}
          rightIcon={<Send className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Soumettre les documents complémentaires
        </Button>
      </div>
    </div>
  );
};
