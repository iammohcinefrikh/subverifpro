import React from 'react';
import { ScanLine, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { KhatemSeal, BabPanel } from '../moroccan/MoroccanPatterns';

export interface OcrPreviewCardProps {
  fileName?: string;
  confidence?: number;
  status?: 'conforme' | 'en_cours' | 'a_corriger';
  statusLabel?: string;
  classification?: string;
  iban?: string;
  ice?: string;
  className?: string;
  inBabPanel?: boolean;
}

export const OcrPreviewCard: React.FC<OcrPreviewCardProps> = ({
  fileName = 'RELEVE_BANCAIRE_RIB.pdf',
  confidence = 99.4,
  status = 'conforme',
  statusLabel = 'RIB Conforme',
  classification = 'Relevé bancaire (RIB)',
  iban = 'MA64 0115 1000 0001 2345 6789 01',
  ice = '002498118000042',
  className = '',
  inBabPanel = true,
}) => {
  const innerContent = (
    <div className="w-full text-white">
      {/* 1. Tympan supérieur de l'arche : Espace aéré avec médaillon centré */}
      <div className="pt-10 pb-3 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-400 shadow-sm">
          <KhatemSeal size={13} fill="none" stroke="#C9962E" strokeWidth={1.5} />
          <span className="text-[9px] font-bold tracking-widest uppercase font-mono text-gold-300">
            LIVE OCR • AUDIT NUMÉRIQUE
          </span>
        </div>
      </div>

      {/* 2. En-tête : Titre centré avec précision au cœur du Bab */}
      <div className="px-7 sm:px-8 pb-3 flex items-center justify-center border-b border-white/10">
        <div className="inline-flex items-center justify-center gap-2 text-gold-400 text-center">
          <ScanLine className="w-4 h-4 text-gold-400 shrink-0 animate-pulse" />
          <span className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-sand-100 text-center">
            Contrôle Numérique Immédiat
          </span>
        </div>
      </div>

      {/* 3. Corps : Espacements confortables pour une lisibilité instantanée */}
      <div className="px-7 sm:px-8 py-4 space-y-3">
        {/* Ligne 1 : Nom de fichier + Taux de confiance émeraude */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileText className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span
              className="font-mono text-xs text-sand-100 font-medium truncate"
              title={fileName}
            >
              {fileName}
            </span>
          </div>

          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[10.5px] font-bold tracking-wide flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {confidence}% confiance
          </span>
        </div>

        {/* Rayon laser horizontal fin */}
        <div className="relative h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-full animate-pulse" />
        </div>

        {/* Champs extraits (IBAN, ICE) en 2 colonnes avec séparateur doré */}
        <div className="grid grid-cols-2 rounded-xl bg-white/[0.03] border border-gold-400/20 p-3 text-left">
          {/* Colonne 1 : IBAN MAROC */}
          <div className="border-r border-gold-400/25 pr-3 min-w-0">
            <span className="text-sand-400 block text-[9.5px] uppercase font-bold tracking-wider">
              IBAN Maroc
            </span>
            <span
              className="text-gold-300 font-mono text-xs font-semibold block mt-0.5 tracking-tight truncate"
              title={iban}
            >
              {iban}
            </span>
          </div>

          {/* Colonne 2 : NUMÉRO ICE */}
          <div className="pl-3 min-w-0">
            <span className="text-sand-400 block text-[9.5px] uppercase font-bold tracking-wider">
              Numéro ICE
            </span>
            <span
              className="text-gold-300 font-mono text-xs font-semibold block mt-0.5 tracking-tight truncate"
              title={ice}
            >
              {ice}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Pied de carte : Ligne fine + Cachet administratif officiel marocain (Tabaâ) */}
      <div className="px-7 sm:px-8 pt-3.5 pb-5 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="text-left">
          <span className="text-sand-400 text-xs font-medium block">Classification auto</span>
          <span className="text-[10.5px] text-sand-300 font-mono font-medium">{classification}</span>
        </div>

        {/* Cachet Tabaâ officiel */}
        {status === 'conforme' && (
          <div
            className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded border-2 border-emerald-400/75 bg-emerald-950/85 text-emerald-300 shadow-md transform -rotate-3 transition-transform hover:rotate-0 select-none"
            title="Sceau d'homologation administrative"
          >
            <div className="absolute inset-0.5 rounded border border-dashed border-emerald-400/40 pointer-events-none" />
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black tracking-wider uppercase font-mono leading-tight">
                {statusLabel}
              </span>
              <span className="text-[7px] text-emerald-400 font-bold tracking-widest uppercase leading-none">
                CERTIFIÉ • مطابق
              </span>
            </div>
          </div>
        )}

        {status === 'en_cours' && (
          <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded border-2 border-gold-400/75 bg-indigo-900/90 text-gold-300 shadow-md transform -rotate-2">
            <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className="text-[10px] font-black tracking-wider uppercase font-mono">
              ANALYSE EN COURS
            </span>
          </div>
        )}

        {status === 'a_corriger' && (
          <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded border-2 border-red-400/75 bg-red-950/85 text-red-300 shadow-md transform -rotate-3">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-[10px] font-black tracking-wider uppercase font-mono">
              À CORRIGER
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (inBabPanel) {
    return (
      <BabPanel className={`w-full max-w-[420px] sm:max-w-[450px] ${className}`}>
        {innerContent}
      </BabPanel>
    );
  }

  return (
    <div
      className={`relative w-full max-w-[420px] sm:max-w-[450px] rounded-2xl bg-[#0c1527] border border-gold-400/25 shadow-2xl overflow-hidden text-white transition-all duration-300 ${className}`}
      style={{
        boxShadow: '0 20px 40px -15px rgba(12, 21, 39, 0.65), 0 0 0 1px rgba(201, 150, 46, 0.15)',
      }}
    >
      <div className="h-[2.5px] w-full bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />
      {innerContent}
    </div>
  );
};
