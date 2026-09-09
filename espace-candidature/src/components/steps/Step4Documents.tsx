import React, { useState } from 'react';
import type { ProcessedDocument, DocumentType } from '../../types/ocr';
import { DropZone } from '../documents/DropZone';
import { DocumentCard } from '../documents/DocumentCard';
import { Button } from '../ui/Button';
import { MOCK_CANDIDATES } from '../../config/mockCandidates';
import type { MockCandidate } from '../../config/mockCandidates';
import { findProgram, GRANT_PROGRAMS } from '../../config/programs';
import {
  generateSyntheticDocument,
  generateAllDocumentsForProgram
} from '../../services/syntheticDocumentGenerator';
import { DOCUMENT_TYPE_DEFINITIONS } from '../../config/documentTypes';
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  FileCheck2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Plus,
  Loader2,
  FolderPlus,
  FileWarning
} from 'lucide-react';

interface Step4Props {
  documents: ProcessedDocument[];
  currentCandidate?: MockCandidate;
  programmeId?: string;
  onAddFiles: (files: File[]) => void;
  onUpdateType: (id: string, newType: DocumentType) => void;
  onUpdateText: (id: string, newText: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4Documents: React.FC<Step4Props> = ({
  documents,
  currentCandidate,
  programmeId,
  onAddFiles,
  onUpdateType,
  onUpdateText,
  onRemove,
  onRetry,
  onNext,
  onPrev
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingDocType, setGeneratingDocType] = useState<string | null>(null);

  const isAnyOcrPending = documents.some((d) => d.statut_ocr === 'en_cours');
  const cand = currentCandidate || MOCK_CANDIDATES[0];
  const progId = programmeId || cand.projet.programme_id;
  const selectedProg = findProgram(progId) || GRANT_PROGRAMS[0];

  const handleProceed = () => {
    if (documents.length === 0) {
      setValidationError('Veuillez déposer au moins une pièce justificative (RIB, Devis, Statuts, Attestation...) avant de continuer.');
      return;
    }
    setValidationError(null);
    onNext();
  };

  const [isGeneratingCvError, setIsGeneratingCvError] = useState(false);

  /**
   * Simulation de l'erreur utilisateur : Dépôt d'un CV au lieu d'une pièce d'identité (CNIE)
   */
  const handleSimulateCvMistake = async () => {
    try {
      setIsGeneratingCvError(true);
      const file = await generateSyntheticDocument('cv', cand);
      const testFile = new File([file], `CV_${cand.demandeur.nom_representant}_Erreur_CNI.png`, { type: 'image/png' });
      onAddFiles([testFile]);
      setValidationError(null);
    } catch (err) {
      console.error('Erreur simulation CV:', err);
    } finally {
      setIsGeneratingCvError(false);
    }
  };

  /**
   * Génération unitaire d'un document synthétique réaliste
   */
  const handleGenerateSingle = async (docType: string) => {
    try {
      setGeneratingDocType(docType);
      const file = await generateSyntheticDocument(docType, cand);
      onAddFiles([file]);
    } catch (err) {
      console.error('Erreur génération document:', err);
    } finally {
      setGeneratingDocType(null);
    }
  };

  /**
   * Génération automatique de toutes les pièces exigées pour le programme sélectionné
   */
  const handleGenerateAllForProgram = async () => {
    if (!selectedProg || !selectedProg.requirements.length) return;
    try {
      setIsGeneratingAll(true);
      const files = await generateAllDocumentsForProgram(selectedProg.requirements, cand);
      if (files.length > 0) {
        onAddFiles(files);
      }
    } catch (err) {
      console.error('Erreur génération globale:', err);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Calcul de conformité par rapport aux exigences du programme
  const requirementsList = selectedProg?.requirements || [];
  const complianceStatus = requirementsList.map((req) => {
    const isPresent = documents.some(
      (d) =>
        d.type_declare === req.document_type ||
        d.type_suggere_ocr === req.document_type ||
        (req.document_type === 'rc' && (d.type_declare === 'rc' || d.type_declare === 'statuts')) ||
        (req.document_type === 'statuts' && (d.type_declare === 'rc' || d.type_declare === 'statuts')) ||
        (req.document_type === 'attestation_cnss' && (d.type_declare === 'attestation_cnss' || d.type_declare === 'attestation')) ||
        (req.document_type === 'attestation_fiscale' && (d.type_declare === 'attestation_fiscale' || d.type_declare === 'attestation'))
    );
    return {
      ...req,
      isProvided: isPresent
    };
  });

  const mandatoryCount = complianceStatus.filter((c) => c.mandatory).length;
  const providedMandatoryCount = complianceStatus.filter((c) => c.mandatory && c.isProvided).length;
  const isFullyCompliant = mandatoryCount > 0 && providedMandatoryCount === mandatoryCount;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Étape 4 sur 5</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            Pièces justificatives & Analyse OCR
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Déposez vos documents officiels ou générez des exemples marocains certifiés conformes au programme <strong className="text-brand-700">{selectedProg?.nom}</strong>.
          </p>
        </div>

        {/* Quick Program Action */}
        {selectedProg && (
          <button
            type="button"
            onClick={handleGenerateAllForProgram}
            disabled={isGeneratingAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
            title={`Génère simultanément les ${selectedProg.requirements.length} pièces exigées pour ${selectedProg.nom}`}
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération des {selectedProg.requirements.length} pièces...
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                ⚡ Générer tout le dossier ({selectedProg.requirements.length} pièces)
              </>
            )}
          </button>
        )}
      </div>

      {/* Program Requirements Checklist Card */}
      {selectedProg && requirementsList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pièces exigées pour le programme : <span className="text-brand-700">{selectedProg.nom}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedProg.categorie} • Plafond d'aide : {selectedProg.plafond_indicatif.toLocaleString('fr-FR')} MAD
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isFullyCompliant
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {providedMandatoryCount} / {mandatoryCount} obligatoires fournies
              </span>

              <button
                type="button"
                onClick={handleGenerateAllForProgram}
                disabled={isGeneratingAll || isGeneratingCvError}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Générer tout ({requirementsList.length})
              </button>

              <button
                type="button"
                onClick={handleSimulateCvMistake}
                disabled={isGeneratingCvError || isGeneratingAll}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Dépose un CV assigné par erreur en tant que Pièce d'Identité pour tester la détection d'anomalie OCR au checkout"
              >
                {isGeneratingCvError ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                ) : (
                  <FileWarning className="w-3.5 h-3.5 text-rose-600" />
                )}
                ⚠️ Test Erreur : CV au lieu de CNI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {complianceStatus.map((req, idx) => {
              const isCurrentlyGenerating = generatingDocType === req.document_type;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                    req.isProvided
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : req.mandatory
                      ? 'bg-rose-50/40 border-rose-200 text-slate-900'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {req.isProvided ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-semibold block truncate">{req.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">type: {req.document_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {req.isProvided ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Fourni
                      </span>
                    ) : (
                      <>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          req.mandatory
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-200/60 text-slate-600'
                        }`}>
                          {req.mandatory ? 'Requis' : 'Optionnel'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleGenerateSingle(req.document_type)}
                          disabled={isCurrentlyGenerating || isGeneratingAll}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title={`Générer un exemple officiel de ${req.name}`}
                        >
                          {isCurrentlyGenerating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          Générer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <DropZone onFilesSelected={onAddFiles} />

      {/* Quick OCR Generators Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-900">
              Générateurs OCR par type de document :
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Cliquez pour générer un fichier réaliste conforme au candidat actif
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {DOCUMENT_TYPE_DEFINITIONS.filter((d) => d.type !== 'autre' && d.type !== 'formulaire').map((def) => {
            const isGeneratingThis = generatingDocType === def.type;
            const isReqForProg = requirementsList.some((r) => r.document_type === def.type);
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => handleGenerateSingle(def.type)}
                disabled={isGeneratingThis || isGeneratingAll}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                  isReqForProg
                    ? 'bg-brand-50 text-brand-800 border-brand-300 hover:bg-brand-100 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={`Générer ${def.label} ${isReqForProg ? '(Exigé par le programme)' : ''}`}
              >
                {isGeneratingThis ? (
                  <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" />
                )}
                <span>{def.label.split('/')[0].split('(')[0].trim()}</span>
                {isReqForProg && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600" title="Exigé pour ce programme" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{validationError}</p>
        </div>
      )}

      {/* Document Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            Pièces jointes au dossier ({documents.length})
          </h3>
          {isAnyOcrPending && (
            <span className="text-xs font-medium text-brand-600 flex items-center gap-1.5 animate-pulse">
              <Zap className="w-3.5 h-3.5" />
              OCR en cours d'exécution...
            </span>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-white space-y-2">
            <p className="text-sm font-semibold text-slate-600">
              Aucune pièce déposée pour le moment
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Glissez-déposez vos fichiers ou cliquez sur <strong>"⚡ Générer tout le dossier"</strong> ci-dessus pour générer en un clic toutes les pièces requises pour ce programme.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onUpdateType={onUpdateType}
                onUpdateText={onUpdateText}
                onRemove={onRemove}
                onRetry={onRetry}
              />
            ))}
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Confidentialité garantie :</strong> L'analyse OCR est exécutée en local sur votre poste (aucun envoi d'images brutes vers un serveur tiers d'analyse). La conversion en base64 est réalisée en mémoire vive lors de la validation.
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Retour au Budget
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleProceed}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continuer vers le Récapitulatif
        </Button>
      </div>
    </div>
  );
};
