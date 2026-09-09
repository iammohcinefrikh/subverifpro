import React, { useState } from 'react';
import type { MockCandidateUser } from '../../types/auth';
import type { WebhookPiecePayload } from '../../types/webhook';
import { getDocumentTypeDefinition } from '../../config/documentTypes';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Eye,
  FileCode
} from 'lucide-react';

interface DossierDocumentsTableProps {
  user: MockCandidateUser;
}

export const DossierDocumentsTable: React.FC<DossierDocumentsTableProps> = ({ user }) => {
  const [selectedPiece, setSelectedPiece] = useState<WebhookPiecePayload | null>(null);

  const existingPieces = user.dossier.pieces;
  const existingTypes = new Set(existingPieces.map((p) => p.type_declare));

  // Combiner les pièces fournies et les pièces manquantes dans une vue unifiée
  const missingTypes = user.dossier.pieces_requises.filter((req) => !existingTypes.has(req));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            Répertoire des pièces justificatives du dossier
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique et conformité des documents numérisés ({existingPieces.length} déposée(s), {missingTypes.length} manquante(s)).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Document / Intitulé</th>
              <th className="py-3 px-4">Type de pièce</th>
              <th className="py-3 px-4">Statut OCR</th>
              <th className="py-3 px-4">Contrôles clés</th>
              <th className="py-3 px-4 text-right">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* 1. Pièces déjà déposées */}
            {existingPieces.map((piece, idx) => {
              const def = getDocumentTypeDefinition(piece.type_declare);

              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-xs font-semibold text-slate-900" title={piece.nom_fichier}>
                        {piece.nom_fichier}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700">
                      {def?.label || piece.type_declare}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Vérifié & Conforme
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex flex-wrap gap-1.5">
                      {piece.champs_detectes?.siret && (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          ICE: {piece.champs_detectes.siret}
                        </span>
                      )}
                      {piece.champs_detectes?.iban && (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          IBAN validé
                        </span>
                      )}
                      {piece.champs_detectes?.montant && (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          {piece.champs_detectes.montant}
                        </span>
                      )}
                      {!piece.champs_detectes?.siret && !piece.champs_detectes?.iban && !piece.champs_detectes?.montant && (
                        <span className="text-slate-400 italic">Signature / texte conforme</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPiece(piece)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Consulter</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* 2. Pièces manquantes déclarées */}
            {missingTypes.map((typeKey) => {
              const def = getDocumentTypeDefinition(typeKey);

              return (
                <tr key={typeKey} className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-amber-950 italic">
                        Document requis non transmis
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-amber-900">
                      {def?.label || typeKey}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      <AlertTriangle className="w-3 h-3" />
                      Manquante
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-amber-800 text-[11px]">
                    Action requise via le bloc supérieur
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="text-amber-600 text-xs font-semibold">—</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal d'aperçu du texte OCR de la pièce */}
      {selectedPiece && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Détail OCR : {selectedPiece.nom_fichier}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPiece(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Texte brut extrait par le navigateur :</span>
              <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-slate-700">
                {selectedPiece.texte_ocr || 'Aucun texte extrait (image ou signature sans typographie standard)'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPiece(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
