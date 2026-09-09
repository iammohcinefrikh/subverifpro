import React, { useState } from 'react';
import type { ComplianceCheck } from '../../services/complianceCheckService';
import {
  FileCheck2,
  AlertTriangle,
  FileText,
  Clock,
  RefreshCw,
  FileX,
  FileQuestion,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { KhatemSeal, useMoroccanTheme } from '../moroccan/MoroccanPatterns';

interface ComplianceCheckCardProps {
  complianceCheck: ComplianceCheck | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const ComplianceCheckCard: React.FC<ComplianceCheckCardProps> = ({
  complianceCheck,
  isLoading = false,
  onRefresh,
}) => {
  const { primaryColor } = useMoroccanTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'present' | 'missing'>('all');

  if (!complianceCheck && !isLoading) {
    return (
      <div className="bg-sand-50 rounded-3xl border border-sand-300 p-6 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-950 font-bold">
            <KhatemSeal size={20} strokeWidth={1.5} />
            <h2 className="font-display text-lg">Vérification des pièces</h2>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-sand-300 text-indigo-950 hover:bg-sand-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Charger depuis compliance_checks</span>
            </button>
          )}
        </div>
        <p className="text-xs text-sand-500">
          Aucun audit de conformité trouvé dans la table <code className="font-mono text-indigo-950 font-bold">public.compliance_checks</code> pour ce dossier.
        </p>
      </div>
    );
  }

  const check = complianceCheck || {
    id: '---',
    application_id: '---',
    program_id: 'maroc-pme',
    completeness_rate: 0,
    status: 'EN_COURS',
    documents: [],
    missing_documents: [],
    expired_documents: [],
    present_documents: [],
    mandatory_documents_count: 0,
    present_count: 0,
    missing_count: 0,
    expired_count: 0,
    checked_at: new Date().toISOString(),
  };

  const checkStatusUpper = (check.status || '').toUpperCase().trim();
  const isConforme =
    ['COMPLETED', 'COMPLETE', 'CONFORME', 'VALIDATED', 'VALIDE', 'VERIFIE', 'VERIFIÉ'].includes(checkStatusUpper) ||
    Number(check.completeness_rate) >= 100 ||
    (check.missing_count === 0 && (check.present_count || 0) > 0);

  const formattedDate = check.checked_at
    ? new Date(check.checked_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '---';

  const presentDocs = Array.isArray(check.present_documents) ? check.present_documents : [];
  const missingDocs = Array.isArray(check.missing_documents) ? check.missing_documents : [];
  const expiredDocs = Array.isArray(check.expired_documents) ? check.expired_documents : [];

  return (
    <div className="relative bg-sand-50 rounded-3xl border border-sand-300 shadow-card p-6 sm:p-8 space-y-6 text-left overflow-hidden">
      {/* 1. En-tête avec titre et badge de statut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sand-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-white shadow-subtle border border-sand-300 shrink-0 text-terracotta-600" style={{ color: primaryColor }}>
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-indigo-950 tracking-tight">
                Vérification des pièces
              </h2>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950 text-gold-400 text-[10px] font-mono font-bold tracking-tight">
                <Database className="w-3 h-3" />
                <span>compliance_checks</span>
              </div>
            </div>
            <p className="text-xs text-sand-500 mt-0.5">
              Contrôle officiel de complétude et d'intégrité réglementaire extrait de la base de données
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Badge de statut */}
          {isConforme ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Conforme (100%)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-900 border border-gold-300 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-gold-700" />
              <span>Compléments Requis ({check.completeness_rate}%)</span>
            </div>
          )}

          {/* Bouton rafraîchissement */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-sand-200 rounded-xl text-sand-600 hover:text-indigo-950 transition-colors border border-sand-300 bg-white cursor-pointer disabled:opacity-50"
              title="Actualiser depuis compliance_checks"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Jauge de Complétude globale */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-sand-300 shadow-subtle space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
          <div className="flex items-center gap-2">
            <KhatemSeal size={15} strokeWidth={1.5} />
            <span>Taux de Complétude Documentaire</span>
          </div>
          <span className="font-mono text-sm" style={{ color: isConforme ? '#047857' : primaryColor }}>
            {check.completeness_rate}%
          </span>
        </div>

        {/* Barre de progression */}
        <div className="h-3 w-full bg-sand-200 rounded-full overflow-hidden p-0.5 border border-sand-300/80">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(4, check.completeness_rate)}%`,
              backgroundColor: isConforme ? '#059669' : primaryColor,
              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* 3. Grille des 4 Compteurs Administratifs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/80 border border-sand-300 text-left space-y-1 shadow-subtle">
          <span className="text-[10px] font-bold text-sand-500 uppercase tracking-wider block">
            Pièces requises
          </span>
          <div className="flex items-center gap-2 text-indigo-950 font-display text-xl font-bold">
            <FileText className="w-4 h-4 text-sand-400" />
            <span>{check.mandatory_documents_count}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-1 shadow-subtle">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Présentes & valides
          </span>
          <div className="flex items-center gap-2 text-emerald-900 font-display text-xl font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{check.present_count}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gold-50/70 border border-gold-200 text-left space-y-1 shadow-subtle">
          <span className="text-[10px] font-bold text-gold-800 uppercase tracking-wider block">
            Pièces manquantes
          </span>
          <div className="flex items-center gap-2 text-gold-900 font-display text-xl font-bold">
            <FileQuestion className="w-4 h-4 text-gold-600" />
            <span>{check.missing_count}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sand-200/50 border border-sand-300 text-left space-y-1 shadow-subtle">
          <span className="text-[10px] font-bold text-sand-500 uppercase tracking-wider block">
            Pièces expirées
          </span>
          <div className="flex items-center gap-2 text-ink-900 font-display text-xl font-bold">
            <FileX className="w-4 h-4 text-sand-400" />
            <span>{check.expired_count}</span>
          </div>
        </div>
      </div>

      {/* 4. Onglets de filtrage des pièces */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-sand-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-950 text-white shadow-xs'
                : 'text-sand-600 hover:text-indigo-950 hover:bg-sand-200/60'
            }`}
          >
            Toutes les pièces ({presentDocs.length + missingDocs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('present')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'present'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Conformes ({presentDocs.length})
          </button>
          {missingDocs.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('missing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'missing'
                  ? 'bg-gold-700 text-white shadow-xs'
                  : 'text-gold-800 hover:bg-gold-50'
              }`}
            >
              Manquantes ({missingDocs.length})
            </button>
          )}
        </div>

        {/* Liste des pièces */}
        <div className="space-y-2">
          {/* Pièces conformes */}
          {(activeTab === 'all' || activeTab === 'present') &&
            presentDocs.map((doc: any, idx: number) => {
              const docName = typeof doc === 'string' ? doc : doc.nom || doc.name || doc.type || `Document #${idx + 1}`;
              const docType = typeof doc === 'object' ? doc.type || 'Justificatif' : 'Justificatif';
              return (
                <div
                  key={`present-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-sand-300 hover:border-emerald-400 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-indigo-950 truncate block font-mono">
                        {docName}
                      </span>
                      <span className="text-[11px] text-sand-500 capitalize">
                        Type : {docType}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-300 shrink-0">
                    Conforme
                  </span>
                </div>
              );
            })}

          {/* Pièces manquantes */}
          {(activeTab === 'all' || activeTab === 'missing') &&
            missingDocs.map((doc: any, idx: number) => {
              const docName = typeof doc === 'string' ? doc : doc.nom || doc.type || `Pièce manquante #${idx + 1}`;
              return (
                <div
                  key={`missing-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gold-50/70 border border-gold-300 hover:border-gold-400 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gold-200 text-gold-900 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-gold-700" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gold-950 truncate block">
                        {docName}
                      </span>
                      <span className="text-[11px] text-gold-700">
                        Pièce obligatoire manquante au dossier
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-gold-200 text-gold-900 font-semibold text-[11px] border border-gold-300 shrink-0">
                    À fournir
                  </span>
                </div>
              );
            })}

          {/* Pièces expirées */}
          {expiredDocs.map((doc: any, idx: number) => {
            const docName = typeof doc === 'string' ? doc : doc.nom || doc.type || `Document expiré #${idx + 1}`;
            return (
              <div
                key={`expired-${idx}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-red-50/70 border border-red-300 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-200 text-red-900 flex items-center justify-center shrink-0">
                    <FileX className="w-4 h-4 text-red-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-red-950 truncate block font-mono">
                      {docName}
                    </span>
                    <span className="text-[11px] text-red-700">Document expiré (&gt; 3 mois)</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-900 font-semibold text-[11px] border border-red-300 shrink-0">
                  Expiré
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Métadonnées d'audit et horodatage */}
      <div className="pt-3 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-sand-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sand-400" />
          <span>Contrôlé le : <strong className="text-indigo-950 font-sans">{formattedDate}</strong></span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <span>Application ID :</span>
          <code className="text-indigo-950 font-bold truncate max-w-[200px]" title={check.application_id}>
            {check.application_id}
          </code>
        </div>
      </div>
    </div>
  );
};
