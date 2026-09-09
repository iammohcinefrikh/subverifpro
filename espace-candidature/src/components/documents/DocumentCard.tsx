import React, { useState } from 'react';
import type { ProcessedDocument, DocumentType } from '../../types/ocr';
import { DOCUMENT_TYPE_DEFINITIONS } from '../../config/documentTypes';
import { Button } from '../ui/Button';
import { OcrEditModal } from './OcrEditModal';
import {
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit3,
  Sparkles,
  Info
} from 'lucide-react';

interface DocumentCardProps {
  document: ProcessedDocument;
  onUpdateType: (id: string, newType: DocumentType) => void;
  onUpdateText: (id: string, newText: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onUpdateType,
  onUpdateText,
  onRemove,
  onRetry
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPdf = document.nom_fichier.toLowerCase().endsWith('.pdf') || document.type_mime === 'application/pdf';
  const fileSizeMb = (document.taille / (1024 * 1024)).toFixed(2);

  const getStatusBadge = () => {
    switch (document.statut_ocr) {
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
            Analyse OCR ({document.ocr_progression || 0}%)
          </span>
        );
      case 'succes':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Texte extrait ({document.texte_ocr.length} car.)
          </span>
        );
      case 'echec':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Échec OCR (saisie manuelle disponible)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            En attente
          </span>
        );
    }
  };

  const currentTypeDefinition = DOCUMENT_TYPE_DEFINITIONS.find((d) => d.type === document.type_declare);
  const suggestedTypeDefinition = document.type_suggere_ocr
    ? DOCUMENT_TYPE_DEFINITIONS.find((d) => d.type === document.type_suggere_ocr)
    : null;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 sm:p-5 transition-all hover:border-slate-300 text-left space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate" title={document.nom_fichier}>
                {document.nom_fichier}
              </h4>
              <p className="text-xs text-slate-400">
                {fileSizeMb} Mo • {isPdf ? 'Document PDF' : 'Image numérique'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {getStatusBadge()}
            <button
              type="button"
              onClick={() => onRemove(document.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              title="Supprimer ce document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* OCR Progress bar during recognition */}
        {document.statut_ocr === 'en_cours' && (
          <div className="space-y-1.5 py-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Traitement OCR client-side en cours...</span>
              <span className="font-semibold text-brand-600">{document.ocr_progression || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${document.ocr_progression || 5}%` }}
              />
            </div>
          </div>
        )}

        {/* Middle Row: Document Type Selection + Heuristic Suggestion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/70">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Type de pièce justificative (sélection manuelle)
            </label>
            <select
              value={document.type_declare}
              onChange={(e) => onUpdateType(document.id, e.target.value as DocumentType)}
              className="w-full text-xs font-medium py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {DOCUMENT_TYPE_DEFINITIONS.map((def) => (
                <option key={def.type} value={def.type}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs space-y-1">
            {suggestedTypeDefinition && suggestedTypeDefinition.type !== document.type_declare ? (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-brand-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-600" />
                  Suggestion OCR : {suggestedTypeDefinition.label}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateType(document.id, suggestedTypeDefinition.type)}
                  className="text-[11px] text-brand-600 hover:text-brand-800 underline font-semibold text-left cursor-pointer"
                >
                  Appliquer cette étiquette suggérée
                </button>
              </div>
            ) : suggestedTypeDefinition && suggestedTypeDefinition.type === document.type_declare ? (
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Type aligné avec l'analyse du document
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                {currentTypeDefinition?.description}
              </span>
            )}
          </div>
        </div>

        {/* OCR Extracted Text Preview & Detected Regex Chips */}
        {document.statut_ocr !== 'en_attente' && (
          <div className="space-y-2.5">
            {/* Detected Fields Preview */}
            {(document.champs_detectes.montant ||
              document.champs_detectes.iban ||
              document.champs_detectes.siret ||
              document.champs_detectes.date) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {document.champs_detectes.montant && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <strong>Montant :</strong> {document.champs_detectes.montant}
                  </span>
                )}
                {document.champs_detectes.iban && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                    <strong>IBAN :</strong> {document.champs_detectes.iban.slice(0, 12)}...
                  </span>
                )}
                {document.champs_detectes.siret && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                    <strong>SIRET :</strong> {document.champs_detectes.siret}
                  </span>
                )}
                {document.champs_detectes.date && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    <strong>Date :</strong> {document.champs_detectes.date}
                  </span>
                )}
              </div>
            )}

            {/* Truncated Text Snippet */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700 font-mono max-h-20 overflow-hidden relative">
              {document.texte_ocr ? (
                <p className="line-clamp-2 leading-relaxed whitespace-pre-wrap">
                  {document.texte_ocr}
                </p>
              ) : (
                <p className="text-slate-400 italic">
                  {document.statut_ocr === 'echec'
                    ? 'Aucun texte extrait. Cliquez sur "Éditer le texte" pour le renseigner manuellement.'
                    : 'Traitement en cours...'}
                </p>
              )}
            </div>

            {/* Actions for this document */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Vérifiez le texte extrait avant de valider
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Éditer le texte extrait
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <OcrEditModal
        document={document}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(newText) => onUpdateText(document.id, newText)}
        onRetryOcr={() => onRetry(document.id)}
      />
    </>
  );
};
