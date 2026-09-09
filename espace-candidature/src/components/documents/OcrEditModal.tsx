import React, { useState } from 'react';
import type { ProcessedDocument } from '../../types/ocr';
import { Button } from '../ui/Button';
import { X, Check, FileText, Sparkles, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { extractFieldsFromText } from '../../services/regexExtractor';

interface OcrEditModalProps {
  document: ProcessedDocument;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedText: string) => void;
  onRetryOcr?: () => void;
}

export const OcrEditModal: React.FC<OcrEditModalProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
  onRetryOcr
}) => {
  const [text, setText] = useState(document.texte_ocr);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentChamps = extractFieldsFromText(text);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplySave = () => {
    onSave(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                Texte extrait : {document.nom_fichier}
              </h3>
              <p className="text-xs text-slate-500">
                Vous pouvez relire et corriger librement le texte extrait par l'OCR avant transmission.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Regex Detected Fields Box */}
          <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Champs détectés par analyse lexicale (indicatif)</span>
              </div>
              <span className="text-[11px] text-brand-700">À titre de suggestion</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white rounded-lg border border-brand-100 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Montant</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {currentChamps.montant || 'Non détecté'}
                  </span>
                  {currentChamps.montant && (
                    <button
                      type="button"
                      onClick={() => handleCopy('montant', currentChamps.montant!)}
                      className="text-slate-400 hover:text-brand-600 p-1"
                      title="Copier le montant"
                    >
                      {copiedKey === 'montant' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-brand-100 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">IBAN</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono font-bold text-slate-800 truncate" title={currentChamps.iban}>
                    {currentChamps.iban ? currentChamps.iban.slice(0, 10) + '...' : 'Non détecté'}
                  </span>
                  {currentChamps.iban && (
                    <button
                      type="button"
                      onClick={() => handleCopy('iban', currentChamps.iban!)}
                      className="text-slate-400 hover:text-brand-600 p-1"
                      title="Copier l'IBAN"
                    >
                      {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-brand-100 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SIRET</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono font-bold text-slate-800 truncate">
                    {currentChamps.siret || 'Non détecté'}
                  </span>
                  {currentChamps.siret && (
                    <button
                      type="button"
                      onClick={() => handleCopy('siret', currentChamps.siret!)}
                      className="text-slate-400 hover:text-brand-600 p-1"
                      title="Copier le SIRET"
                    >
                      {copiedKey === 'siret' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-brand-100 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {currentChamps.date || 'Non détectée'}
                  </span>
                  {currentChamps.date && (
                    <button
                      type="button"
                      onClick={() => handleCopy('date', currentChamps.date!)}
                      className="text-slate-400 hover:text-brand-600 p-1"
                      title="Copier la date"
                    >
                      {copiedKey === 'date' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ocr-text" className="text-xs font-bold text-slate-700">
                Texte brut extrait ({text.length} caractères)
              </label>
              <span className="text-[11px] text-slate-400">
                Méthode : {document.ocr_methode || 'OCR standard'}
              </span>
            </div>
            <textarea
              id="ocr-text"
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Le texte extrait apparaîtra ici. En cas d'erreur d'OCR, vous pouvez saisir ou coller le contenu manuellement."
              className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 custom-scrollbar leading-relaxed"
            />
          </div>

          {document.statut_ocr === 'echec' && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                L'OCR n'a pas pu reconnaître le texte automatiquement (document peu contrasté ou image floue). Vous pouvez renseigner le contenu manuellement dans le champ ci-dessus.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {onRetryOcr && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRetryOcr}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Relancer l'analyse OCR
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplySave}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
