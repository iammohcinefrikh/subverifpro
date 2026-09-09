import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { Frieze, KhatemSeal, useMoroccanTheme } from '../moroccan/MoroccanPatterns';

export const Footer: React.FC = () => {
  const { accentColor } = useMoroccanTheme();

  return (
    <footer className="mt-auto bg-indigo-950 text-sand-300 text-xs no-print relative overflow-hidden">
      {/* Frise géométrique séparatrice en tête de pied de page */}
      <div className="w-full">
        <Frieze color={accentColor} height={14} className="opacity-90" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identité & Sceau */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <KhatemSeal size={24} fill="#1A2B4C" stroke={accentColor} strokeWidth={1.8} />
              <span className="font-display text-2xl font-bold text-white tracking-wide">
                SubVerif
              </span>
            </div>
            <p className="text-sand-400 text-[11.5px] leading-relaxed">
              Plateforme nationale marocaine de dépôt, classification automatique et vérification préalable des dossiers de subvention publique.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-900 border border-gold-400/30 text-[10px] text-gold-400 font-semibold">
              <span>Souveraineté Numérique & Confidentialité</span>
            </div>
          </div>

          {/* Garanties & Souveraineté */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Zéro Rétention Locale</span>
            </div>
            <p className="text-sand-400 leading-relaxed text-[11.5px]">
              L'extraction OCR opère exclusivement dans la mémoire vive de votre navigateur. Aucune pièce n'est conservée sans consentement explicite.
            </p>
          </div>

          {/* Chiffrement & Normes */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <Lock className="w-4 h-4 text-gold-400" />
              <span>Chiffrement Bout-en-Bout</span>
            </div>
            <p className="text-sand-400 leading-relaxed text-[11.5px]">
              Transmission sécurisée TLS 1.3 vers les centres de calcul marocains et l'orchestrateur de commission de financement.
            </p>
          </div>

          {/* Spécification & Conformité CNDP */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <FileCode className="w-4 h-4 text-terracotta-400" />
              <span>Conformité & Moteur</span>
            </div>
            <ul className="space-y-1.5 text-sand-400 text-[11.5px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Moteur OCR Hybride Tesseract.js / PDF.js</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Format standardisé JSON & Base64</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Protection des données CNDP (Loi 09-08)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-sand-400 text-[11.5px]">
          <p>© 2026 Royaume du Maroc — Plateforme SubVerif. Tous droits réservés.</p>
          <p className="flex items-center gap-3">
            <span>Rabat • Fès • Casablanca • Marrakech</span>
            <span>•</span>
            <span className="text-gold-400 font-medium">Session Officielle 2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
