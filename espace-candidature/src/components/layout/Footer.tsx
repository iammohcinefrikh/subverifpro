import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { Frieze, KhatemSeal, useMoroccanTheme } from '../moroccan/MoroccanPatterns';

export const Footer: React.FC = () => {
  const { accentColor } = useMoroccanTheme();

  return (
    <footer className="mt-auto bg-indigo-950 text-white text-xs no-print relative overflow-hidden border-t-2 border-gold-500/40 shadow-2xl">
      {/* 1. Frise Géométrique Décorative en tête de bandeau */}
      <div className="w-full bg-indigo-900/60 py-2 border-b border-gold-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Frieze color={accentColor || '#C9962E'} height={10} className="opacity-90" />
        </div>
      </div>

      {/* 2. Contenu Principal à Haute Lisibilité */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Colonne 1 : Identité & Sceau */}
          <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <KhatemSeal size={28} fill="#1A2B4C" stroke="#D4A72C" strokeWidth={1.8} />
                <span className="font-display text-2xl font-bold text-white tracking-wide">
                  SubVerif
                </span>
              </div>
              <p className="text-sand-100 text-[12px] leading-relaxed font-normal">
                Plateforme nationale marocaine de dépôt, classification automatique et vérification préalable des dossiers de subvention publique.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/15 border border-gold-400/40 text-[11px] text-gold-300 font-medium">
              <span>Souveraineté Numérique & Confidentialité</span>
            </div>
          </div>

          {/* Colonne 2 : Garanties & Souveraineté */}
          <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span>Zéro Rétention Locale</span>
            </div>
            <p className="text-sand-100 leading-relaxed text-[12px]">
              L'extraction OCR opère exclusivement dans la mémoire vive de votre navigateur. Aucune pièce n'est conservée sans consentement explicite.
            </p>
          </div>

          {/* Colonne 3 : Chiffrement & Normes */}
          <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-400/40 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-gold-400" />
              </div>
              <span>Chiffrement Bout-en-Bout</span>
            </div>
            <p className="text-sand-100 leading-relaxed text-[12px]">
              Transmission sécurisée TLS 1.3 vers les centres de calcul marocains et l'orchestrateur de commission de financement.
            </p>
          </div>

          {/* Colonne 4 : Spécification & CNDP */}
          <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-terracotta-500/20 border border-terracotta-400/40 flex items-center justify-center shrink-0">
                <FileCode className="w-4 h-4 text-terracotta-300" />
              </div>
              <span>Conformité & Moteur</span>
            </div>
            <ul className="space-y-2 text-sand-100 text-[12px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Moteur OCR Hybride Tesseract / PDF.js</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Format standardisé JSON & Base64</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protection des données CNDP (Loi 09-08)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bandeau Inférieur de Copyright */}
        <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-sand-200 text-xs font-medium">
          <p>© 2026 Royaume du Maroc — Plateforme SubVerif. Tous droits réservés.</p>
          <p className="flex items-center gap-3">
            <span className="text-sand-300">Rabat • Fès • Casablanca • Marrakech</span>
            <span className="text-gold-400">•</span>
            <span className="text-gold-300 font-semibold tracking-wide">Session Officielle 2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
