import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-6 text-slate-500 text-xs no-print">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Shield className="w-4 h-4 text-brand-600" />
              <span>Garanties & Confidentialité</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Les fichiers déposés sont traités directement dans la mémoire de votre navigateur (OCR côté client). Aucune pièce n'est conservée localement après la fermeture de session.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Lock className="w-4 h-4 text-brand-600" />
              <span>Canal de Transmission Sécurisé</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Le dossier et les métadonnées extraites sont chiffrés et expédiés via protocole HTTPS sécurisé vers le webhook de vérification.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <FileCode className="w-4 h-4 text-brand-600" />
              <span>Spécification Technique</span>
            </div>
            <ul className="space-y-1 text-slate-500">
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>PDF.js natif + Tesseract OCR (fra)</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Payload JSON avec encodage Base64</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Classification automatique heuristique</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© 2026 SubVerif — Module Démonstrateur de Vérification Préalable. Données de démonstration fictives.</p>
          <p className="text-slate-400">
            Conforme RGPD • Accessibilité RGAA • Chiffrement de bout en bout
          </p>
        </div>
      </div>
    </footer>
  );
};
