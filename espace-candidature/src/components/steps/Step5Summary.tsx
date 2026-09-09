import React, { useState } from 'react';
import type { DossierState } from '../../types/form';
import { Button } from '../ui/Button';
import { ErrorAlert } from '../feedback/ErrorAlert';
import { GRANT_PROGRAMS, findProgram } from '../../config/programs';
import { getWebhookUrl, setCustomWebhookUrl, DEFAULT_WEBHOOK_URL } from '../../services/webhookService';
import {
  Send,
  ArrowLeft,
  Building2,
  Lightbulb,
  Calculator,
  FileCheck2,
  CheckCircle2,
  Edit2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Settings,
  Check,
  RotateCcw,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { CheckoutDocumentAuditCard } from '../documents/CheckoutDocumentAuditCard';
import { auditDossierDocuments } from '../../services/documentAuditService';

interface Step5Props {
  dossier: DossierState;
  onJumpToStep: (step: number) => void;
  onSubmitDossier: () => void;
  onSimulateSuccess?: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  submissionError: { message: string; statusCode?: number } | null;
  onRetry: () => void;
}

export const Step5Summary: React.FC<Step5Props> = ({
  dossier,
  onJumpToStep,
  onSubmitDossier,
  onSimulateSuccess,
  onPrev,
  isSubmitting,
  submissionError,
  onRetry
}) => {
  const [certified, setCertified] = useState(dossier.certification_sur_honneur || false);
  const [certError, setCertError] = useState<string | null>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getWebhookUrl());
  const [tempUrl, setTempUrl] = useState(getWebhookUrl());
  const [savedUrlFeedback, setSavedUrlFeedback] = useState(false);
  const [showMismatchConfirmModal, setShowMismatchConfirmModal] = useState(false);

  const selectedProgram = findProgram(dossier.projet.programme_id) || GRANT_PROGRAMS[0];
  const auditSummary = auditDossierDocuments(dossier.pieces, dossier.demandeur);

  // Calcul de conformité des pièces exigées
  const requirementsList = selectedProgram?.requirements || [];
  const complianceStatus = requirementsList.map((req) => {
    const isPresent = dossier.pieces.some(
      (d) =>
        d.type_declare === req.document_type ||
        d.type_suggere_ocr === req.document_type ||
        (req.document_type === 'rc' && (d.type_declare === 'rc' || d.type_declare === 'statuts')) ||
        (req.document_type === 'statuts' && (d.type_declare === 'rc' || d.type_declare === 'statuts')) ||
        (req.document_type === 'attestation_cnss' && (d.type_declare === 'attestation_cnss' || d.type_declare === 'attestation'))
    );
    return {
      ...req,
      isProvided: isPresent
    };
  });

  const mandatoryCount = complianceStatus.filter((c) => c.mandatory).length;
  const providedMandatoryCount = complianceStatus.filter((c) => c.mandatory && c.isProvided).length;
  const isFullyCompliant = mandatoryCount > 0 && providedMandatoryCount === mandatoryCount;

  const handleSaveCustomUrl = () => {
    setCustomWebhookUrl(tempUrl);
    setCurrentUrl(tempUrl);
    setIsEditingUrl(false);
    setSavedUrlFeedback(true);
    setTimeout(() => setSavedUrlFeedback(false), 3000);
  };

  const handleResetDefaultUrl = () => {
    setCustomWebhookUrl(null);
    setCurrentUrl(DEFAULT_WEBHOOK_URL);
    setTempUrl(DEFAULT_WEBHOOK_URL);
    setIsEditingUrl(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certified) {
      setCertError('Vous devez obligatoirement certifier sur l\'honneur l\'exactitude des renseignements fournis pour soumettre la candidature.');
      return;
    }
    if (auditSummary.aDesErreursBloquantes) {
      setShowMismatchConfirmModal(true);
      return;
    }
    setCertError(null);
    onSubmitDossier();
  };

  return (
    <form id="wizard-active-form" onSubmit={handleFormSubmit} noValidate className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Étape 5 sur 5</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-brand-600" />
            Récapitulatif & Soumission
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Vérifiez l'ensemble des données saisies et des pièces analysées avant l'expédition définitive.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-700">Dossier prêt pour transmission</span>
        </div>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <ErrorAlert
          message={submissionError.message}
          statusCode={submissionError.statusCode}
          onRetry={onRetry}
          onSimulateSuccess={onSimulateSuccess}
          onToggleEditUrl={() => setIsEditingUrl(!isEditingUrl)}
          isLoading={isSubmitting}
        />
      )}

      {/* Alerte Majeure Détection d'Erreur OCR (Haut de Page) */}
      {auditSummary.aDesErreursBloquantes && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold text-sm text-rose-900">
                ⚠️ Incohérence critique de document détectée (Anti-Erreur OCR)
              </p>
              <p className="text-rose-800 mt-0.5">
                {auditSummary.nbErreursCritiques} fichier(s) téléversé(s) ne correspondent pas aux pièces demandées (ex : un Curriculum Vitae au lieu de la CNIE).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            Corriger à l'Étape 4
          </button>
        </div>
      )}

      {/* Section 1 : Demandeur */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            1. Profil du demandeur
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Structure candidate</span>
            <span className="font-bold text-slate-800 text-sm">{dossier.demandeur.nom_ou_raison_sociale}</span>
            <span className="text-slate-500 block capitalize">({dossier.demandeur.structure_type})</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Identifiant légal (ICE / SIRET)</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{dossier.demandeur.siret}</span>
            <span className="text-slate-500 block">{dossier.demandeur.secteur_activite}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Siège & Ancienneté</span>
            <span className="text-slate-800 font-medium block">
              {dossier.demandeur.adresse}, {dossier.demandeur.code_postal} {dossier.demandeur.ville}
            </span>
            <span className="text-slate-500 block">
              {dossier.demandeur.region} • {dossier.demandeur.anciennete_annees} an(s) d'exercice
            </span>
          </div>
        </div>

        {/* Coordonnées Représentant */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-slate-50/70 p-3 rounded-lg">
          <div>
            <span className="text-slate-400 block font-medium">Représentant légal</span>
            <span className="font-bold text-slate-900 text-sm">
              {dossier.demandeur.prenom_representant} {dossier.demandeur.nom_representant}
            </span>
            <span className="font-mono text-brand-700 font-semibold text-[11px] block">
              CIN : {dossier.demandeur.cin_representant || 'Non renseigné'}
              {dossier.demandeur.date_naissance_representant && ` • Né(e) le ${dossier.demandeur.date_naissance_representant}`}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Courriel de notification</span>
            <span className="text-slate-800 font-medium block truncate" title={dossier.demandeur.email_representant}>
              {dossier.demandeur.email_representant || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Téléphone direct</span>
            <span className="font-mono text-slate-800 font-medium block">
              {dossier.demandeur.telephone_representant || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2 : Projet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-brand-600" />
            2. Projet présenté
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(2)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Dispositif / Programme visé</span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="font-bold text-brand-900 text-sm">
                {selectedProgram ? selectedProgram.nom : dossier.projet.programme_id}
              </span>
              {selectedProgram && (
                <>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                    {selectedProgram.categorie}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedProgram.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {selectedProgram.status === 'ACTIVE' ? 'Programme Actif' : 'Historique'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    • Plafond : {selectedProgram.plafond_indicatif.toLocaleString('fr-FR')} DH
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Objet de l'action</span>
            <span className="font-bold text-slate-800 text-sm">{dossier.projet.objet_projet}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Calendrier d'exécution</span>
            <span className="text-slate-800 font-semibold">
              Du {dossier.projet.date_debut} au {dossier.projet.date_fin}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Description des opérations</span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-sans text-xs">
              {dossier.projet.description}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 : Budget */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-600" />
            3. Budget prévisionnel & Subvention demandée
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 block">Coût total du projet :</span>
            <span className="text-base font-extrabold text-slate-900">
              {dossier.budget.montant_total.toLocaleString('fr-FR')} DH
            </span>
          </div>
          <div>
            <span className="text-brand-700 block font-semibold">Subvention demandée :</span>
            <span className="text-base font-extrabold text-brand-700">
              {dossier.budget.montant_demande.toLocaleString('fr-FR')} DH
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Soit {Math.round((dossier.budget.montant_demande / dossier.budget.montant_total) * 100)}% de couverture publique sollicitée
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Postes de dépenses ({dossier.budget.depenses.length})
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {dossier.budget.depenses.map((d) => (
                <li key={d.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-subtle">
                  <span className="truncate pr-2">{d.libelle}</span>
                  <span className="font-semibold text-slate-900 shrink-0">{d.montant.toLocaleString('fr-FR')} DH</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Plan de financement ({dossier.budget.financements.length})
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {dossier.budget.financements.map((f) => (
                <li key={f.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-subtle">
                  <div className="truncate pr-2">
                    <span>{f.financeur}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 capitalize">({f.statut})</span>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">{f.montant.toLocaleString('fr-FR')} DH</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cadre de contrôle et détection d'anomalies OCR (Anti-Erreur de Dépôt) */}
      <CheckoutDocumentAuditCard
        pieces={dossier.pieces}
        demandeur={dossier.demandeur}
        onJumpToStep={onJumpToStep}
      />

      {/* Section 4 : Pièces & OCR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            4. Pièces justificatives & Conformité OCR ({dossier.pieces.length} pièces)
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
        </div>

        {/* Contrôle des pièces requises par le programme */}
        {selectedProgram && requirementsList.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">
                  Exigences documentaires : {selectedProgram.nom}
                </span>
              </div>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isFullyCompliant
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {providedMandatoryCount} / {mandatoryCount} pièces obligatoires présentes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {complianceStatus.map((req, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                    req.isProvided
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : req.mandatory
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {req.isProvided ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{req.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                      req.isProvided
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.mandatory
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {req.isProvided ? 'OK' : req.mandatory ? 'Requis' : 'Optionnel'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {dossier.pieces.map((piece) => {
            const pieceAudit = auditSummary.items.find((i) => i.documentId === piece.id);
            const isCritical = pieceAudit?.status === 'erreur_critique';
            const isWarning = pieceAudit?.status === 'avertissement';

            return (
              <div
                key={piece.id}
                className={`p-4 rounded-xl border-2 space-y-2.5 text-xs transition-all ${
                  isCritical
                    ? 'border-rose-400 bg-rose-50/70 shadow-sm'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{piece.nom_fichier}</span>
                    <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-brand-50 text-brand-800 border border-brand-200 uppercase">
                      {piece.type_declare}
                    </span>
                    {isCritical && (
                      <span className="font-extrabold px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white uppercase animate-pulse">
                        🚨 {pieceAudit?.anomalieTitre || 'Fichier non ciblé'}
                      </span>
                    )}
                    {isWarning && (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ Attention
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {(piece.taille / (1024 * 1024)).toFixed(2)} Mo • Statut OCR : {piece.statut_ocr}
                    </span>
                    {isCritical && (
                      <button
                        type="button"
                        onClick={() => onJumpToStep(4)}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                      >
                        Remplacer
                      </button>
                    )}
                  </div>
                </div>

                {isCritical && pieceAudit && (
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-rose-950 text-[11px] space-y-1">
                    <p className="font-bold">{pieceAudit.diagnostic}</p>
                    <p className="text-slate-600 italic">{pieceAudit.explicationDetaillee}</p>
                  </div>
                )}

                {piece.texte_ocr ? (
                  <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-600 line-clamp-2">
                    {piece.texte_ocr}
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100 rounded text-slate-400 italic text-[11px]">
                    Aucun texte extrait pour cette pièce.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Certification sur l'honneur */}
      <div className="bg-white rounded-xl border-2 border-brand-200 shadow-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-600" />
          Déclaration et certification sur l'honneur
        </h3>

        <div className="p-4 rounded-lg bg-brand-50/50 border border-brand-100 text-xs text-brand-900 space-y-2">
          <p className="font-medium leading-relaxed">
            En cochant cette case, le représentant légal certifie sur l'honneur :
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
            <li>L'exactitude des informations administratives et financières transmises.</li>
            <li>L'authenticité des pièces justificatives fournies (RIB, devis, attestations, statuts).</li>
            <li>La régularité de la structure candidate vis-à-vis de ses obligations fiscales et sociales.</li>
          </ul>
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => {
              setCertified(e.target.checked);
              if (e.target.checked) setCertError(null);
            }}
            className="mt-1 w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-slate-800 leading-snug">
            Je certifie sur l'honneur l'exactitude de l'ensemble des renseignements et pièces constituant cette candidature.
            <span className="text-rose-500 ml-1">*</span>
          </span>
        </label>

        {certError && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {certError}
          </p>
        )}

        {auditSummary.aDesErreursBloquantes && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Alerte Anti-Erreur OCR : Pièce(s) non conforme(s)</span>
              <span className="text-slate-700">
                {auditSummary.nbErreursCritiques} anomalie(s) critique(s) détectée(s) (ex : Curriculum Vitae téléversé par inadvertance au lieu de la CNIE officielle). Veuillez remplacer le fichier avant la transmission.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Webhook endpoint preview & config */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold text-slate-700">Point de terminaison Webhook :</span>
            <code className="font-mono text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-sm sm:max-w-md" title={currentUrl}>
              {currentUrl}
            </code>
          </div>

          <div className="flex items-center gap-2">
            {savedUrlFeedback && (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Enregistré !
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="text-brand-600 hover:text-brand-800 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              {isEditingUrl ? 'Fermer' : 'Changer l\'URL'}
            </button>
          </div>
        </div>

        {isEditingUrl && (
          <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-2 animate-fadeIn">
            <label className="block text-[11px] font-bold text-slate-700">
              URL personnalisée du Webhook de destination (POST JSON) :
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://webhook.site/votre-identifiant ou https://..."
                className="flex-1 text-xs py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveCustomUrl}
                  leftIcon={<Check className="w-3 h-3" />}
                >
                  Appliquer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaultUrl}
                  leftIcon={<RotateCcw className="w-3 h-3" />}
                  title="Rétablir l'URL officielle par défaut"
                >
                  Défaut
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Pour tester la réception en temps réel, vous pouvez utiliser une URL éphémère créée sur <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline font-medium">webhook.site</a>.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isSubmitting}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Retour aux Pièces
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Soumettre ma candidature
        </Button>
      </div>

      {/* Modal d'avertissement de soumission avec document non ciblé */}
      {showMismatchConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Fichier non ciblé détecté dans votre dossier
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le contrôle OCR a identifié qu'au moins un fichier (ex : <strong>Curriculum Vitae</strong> personnel) a été téléversé par inadvertance à la place d'une pièce administrative requise (ex : <strong>CNIE</strong> ou devis).
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 text-left space-y-1">
                <span className="font-bold block">Risque de rejet de la candidature :</span>
                <span>Les commissions régionales et nationales d'octroi de subventions éliminent immédiatement les dossiers contenant des pièces non conformes.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full sm:flex-1 bg-brand-600 hover:bg-brand-700"
                onClick={() => {
                  setShowMismatchConfirmModal(false);
                  onJumpToStep(4);
                }}
              >
                Corriger à l'Étape 4 (Recommandé)
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => {
                  setShowMismatchConfirmModal(false);
                  onSubmitDossier();
                }}
              >
                Soumettre malgré l'anomalie
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
