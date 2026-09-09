import React, { useState } from 'react';
import type { ProcessedDocument } from '../../types/ocr';
import type { DemandeurFormData } from '../../types/form';
import { auditDossierDocuments } from '../../services/documentAuditService';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  FileWarning,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CheckoutDocumentAuditCardProps {
  pieces: ProcessedDocument[];
  demandeur: DemandeurFormData;
  onJumpToStep: (step: number) => void;
}

export const CheckoutDocumentAuditCard: React.FC<CheckoutDocumentAuditCardProps> = ({
  pieces,
  demandeur,
  onJumpToStep
}) => {
  const [showAllDetails, setShowAllDetails] = useState(false);

  const auditSummary = auditDossierDocuments(pieces, demandeur);
  const criticalItems = auditSummary.items.filter((i) => i.status === 'erreur_critique');
  const warningItems = auditSummary.items.filter((i) => i.status === 'avertissement');

  if (pieces.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-950">Aucun document justificatif versé</h4>
          <p className="mt-1 text-amber-800">
            Veuillez ajouter les pièces justificatives obligatoires avant de procéder à la soumission.
          </p>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
          >
            Aller à l'Étape 4 (Dépôt des pièces)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 transition-all duration-200 overflow-hidden shadow-card ${
        auditSummary.aDesErreursBloquantes
          ? 'bg-white border-rose-400 shadow-rose-100'
          : auditSummary.nbAvertissements > 0
          ? 'bg-white border-amber-300'
          : 'bg-white border-emerald-300'
      }`}
    >
      {/* Header Cadre */}
      <div
        className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          auditSummary.aDesErreursBloquantes
            ? 'bg-rose-50/90 border-rose-200'
            : auditSummary.nbAvertissements > 0
            ? 'bg-amber-50/80 border-amber-200'
            : 'bg-emerald-50/80 border-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              auditSummary.aDesErreursBloquantes
                ? 'bg-rose-600 text-white'
                : auditSummary.nbAvertissements > 0
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {auditSummary.aDesErreursBloquantes ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : auditSummary.nbAvertissements > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-xs">
                Contrôle Anti-Erreur OCR
              </span>
              {auditSummary.aDesErreursBloquantes && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  Incohérence critique détectée
                </span>
              )}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
              Vérification du contenu des fichiers OCR (Validation Pré-Soumission)
            </h3>
          </div>
        </div>

        {/* Badges de comptage */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
              auditSummary.nbConformes > 0
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {auditSummary.nbConformes} conforme(s)
          </span>

          {auditSummary.nbAvertissements > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {auditSummary.nbAvertissements} divergence(s)
            </span>
          )}

          {auditSummary.nbErreursCritiques > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {auditSummary.nbErreursCritiques} anomalie(s) critique(s)
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Alerte Majeure si Erreur Critique (ex: CV au lieu de CNI) */}
        {auditSummary.aDesErreursBloquantes ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <FileWarning className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-rose-900">
                  Alerte : Le fichier versé ne correspond pas à la pièce justificative demandée !
                </p>
                <p className="text-rose-800 leading-relaxed">
                  L'algorithme de contrôle OCR a analysé le contenu textuel de vos fichiers et a détecté qu'un document déposé n'est pas la pièce officielle attendue (ex : téléversement d'un <strong>Curriculum Vitae</strong> personnel au lieu de la <strong>Carte Nationale d'Identité</strong> ou d'un devis).
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Corriger et remplacer le fichier à l'Étape 4
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-rose-700 font-medium">
                Un dossier comportant des pièces inadaptées risque d'être immédiatement rejeté par le comité d'instruction.
              </span>
            </div>
          </div>
        ) : auditSummary.nbAvertissements > 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-amber-900">Points d'attention détectés sur les pièces</p>
              <p className="text-amber-800 leading-relaxed">
                Les pièces déposées semblent globalement valides, mais certaines informations extraites (comme la CIN ou le numéro ICE) présentent des divergences avec vos données déclarées.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-emerald-900">
                Conformité documentaire 100% vérifiée
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Toutes les pièces justificatives analysées par OCR (CNIE, Relevé bancaire, Devis, Registre du commerce) correspondent parfaitement aux typologies exigées par le programme.
              </p>
            </div>
          </div>
        )}

        {/* Liste des Anomalies Critiques (Mise en avant prioritaire) */}
        {criticalItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Anomalies critiques à rectifier ({criticalItems.length})
            </h4>

            <div className="space-y-2.5">
              {criticalItems.map((item) => (
                <div
                  key={item.documentId}
                  className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/40 space-y-3 transition-all text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.nomFichier}</span>
                        {item.estUnCv && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wide">
                            🚨 Curriculum Vitae (CV) Détecté
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="text-slate-500 font-medium">Demande ciblée :</span>
                        <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.labelDeclare}
                        </span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-rose-700 font-bold">Contenu réel analysé : {item.typeDetecteEstime}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onJumpToStep(4)}
                      className="border-rose-300 text-rose-800 hover:bg-rose-100 hover:border-rose-400 shrink-0"
                    >
                      Remplacer cette pièce
                    </Button>
                  </div>

                  {/* Diagnostic & Recommandation */}
                  <div className="p-3 bg-white rounded-lg border border-rose-200 space-y-1.5">
                    <p className="font-bold text-rose-950 text-xs">{item.anomalieTitre}</p>
                    <p className="text-slate-700 leading-relaxed text-[11px]">{item.diagnostic}</p>
                    <p className="text-slate-500 leading-relaxed text-[11px] italic">{item.explicationDetaillee}</p>

                    {item.recommandation && (
                      <div className="mt-2 pt-2 border-t border-rose-100 flex items-start gap-1.5 text-[11px] font-semibold text-rose-900">
                        <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>Action conseillée : {item.recommandation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des Divergences / Avertissements */}
        {warningItems.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Points d'attention ({warningItems.length})
            </h4>

            <div className="space-y-2">
              {warningItems.map((item) => (
                <div
                  key={item.documentId}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.nomFichier}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Divergence mineure
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px]">{item.diagnostic}</p>
                  {item.recommandation && (
                    <p className="text-[11px] font-medium text-amber-800">{item.recommandation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pièces Conformes & Vue Détaillée */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              Voir le détail complet de l'audit pour les {pieces.length} pièce(s) versée(s)
            </span>
            {showAllDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showAllDetails && (
            <div className="mt-3 space-y-2 pl-1 pr-1 animate-fadeIn">
              {auditSummary.items.map((item) => (
                <div
                  key={item.documentId}
                  className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    item.status === 'erreur_critique'
                      ? 'bg-rose-50/60 border-rose-200'
                      : item.status === 'avertissement'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 truncate">{item.nomFichier}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          item.status === 'erreur_critique'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'avertissement'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status === 'erreur_critique' ? 'Non conforme' : item.status === 'avertissement' ? 'Attention' : 'Conforme'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      Déclaré : <span className="font-medium text-slate-800">{item.labelDeclare}</span> • Estimé :{' '}
                      <span className="font-medium text-slate-800">{item.typeDetecteEstime}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">{item.diagnostic}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <button
                      type="button"
                      onClick={() => onJumpToStep(4)}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 underline cursor-pointer"
                    >
                      Modifier à l'étape 4
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
