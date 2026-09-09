import React, { useState } from 'react';
import type { MockCandidateUser } from '../../types/auth';
import type { WebhookPiecePayload } from '../../types/webhook';
import type { DocumentType } from '../../types/ocr';
import { getDocumentTypeDefinition } from '../../config/documentTypes';
import { processFileOcr, fileToBase64 } from '../../services/ocrService';
import { addComplementPiecesToDossier } from '../../services/mockAuthService';
import { saveComplianceCheckToDb } from '../../services/complianceCheckService';
import { generateSyntheticDocument } from '../../services/syntheticDocumentGenerator';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Eye,
  FileCode,
  Upload,
  RefreshCw,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';

interface DossierDocumentsTableProps {
  user: MockCandidateUser;
  onDossierUpdated?: () => void;
  onTriggerComplement?: () => void;
}

export const DossierDocumentsTable: React.FC<DossierDocumentsTableProps> = ({
  user,
  onDossierUpdated,
  onTriggerComplement
}) => {
  const [selectedPiece, setSelectedPiece] = useState<WebhookPiecePayload | null>(null);
  const [processingType, setProcessingType] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const existingPieces = user.dossier.pieces;
  const existingTypes = new Set(existingPieces.map((p) => p.type_declare));

  // Combiner les pièces fournies et les pièces manquantes dans une vue unifiée
  const missingTypes = user.dossier.pieces_requises.filter((req) => !existingTypes.has(req));

  /**
   * Traitement d'un fichier téléversé par le candidat (ajout ou remplacement)
   */
  const handleFileProcess = async (file: File, targetType: DocumentType) => {
    try {
      setProcessingType(targetType);
      setSuccessNotice(null);

      const base64 = await fileToBase64(file);
      const ocrResult = await processFileOcr(file);

      const newPiece: WebhookPiecePayload = {
        nom_fichier: file.name,
        type_declare: targetType,
        type_suggere_ocr: ocrResult.type_suggere,
        texte_ocr: ocrResult.texte,
        champs_detectes: ocrResult.champs_detectes,
        fichier_base64: base64,
        statut_ocr: ocrResult.succes ? 'succes' : 'echec'
      };

      // 1. Sauvegarder dans le dossier local
      const updatedUser = addComplementPiecesToDossier(
        user.id,
        [newPiece],
        `Mise à jour du document ${targetType} effectuée le ${new Date().toLocaleDateString('fr-FR')}`
      );

      // 2. Calculer le nouveau taux d'exhaustivité
      const allPieces = updatedUser ? updatedUser.dossier.pieces : [...existingPieces.filter((p) => p.type_declare !== targetType), newPiece];
      const piecesRequises = user.dossier.pieces_requises || ['piece_identite', 'rib', 'devis', 'statuts'];
      const currentTypes = new Set(allPieces.map((p) => p.type_declare));
      const remainingMissing = piecesRequises.filter((req) => !currentTypes.has(req));
      const isComplete = remainingMissing.length === 0;

      const rate = piecesRequises.length > 0
        ? Math.min(100, Math.round(((piecesRequises.length - remainingMissing.length) / piecesRequises.length) * 100))
        : 100;

      // 3. Mise à jour directe de la table public.compliance_checks dans PostgreSQL
      await saveComplianceCheckToDb({
        candidate_id: user.id,
        application_id: (user.dossier as any).db_application_id || user.dossier.dossier_id,
        program_id: user.projet.programme_id || 'prog-forsa',
        completeness_rate: rate,
        status: isComplete ? 'COMPLETE' : 'INCOMPLETE',
        mandatory_documents_count: piecesRequises.length,
        present_count: allPieces.length,
        missing_count: remainingMissing.length,
        expired_count: 0,
        present_documents: allPieces.map((p) => p.type_declare),
        missing_documents: remainingMissing.map((t) => ({
          type: t,
          document_type: t,
          status: 'MISSING'
        })),
        documents: allPieces.map((p) => ({
          type: p.type_declare,
          document_type: p.type_declare,
          nom_fichier: p.nom_fichier,
          status: 'PRESENT'
        }))
      });

      setSuccessNotice(`Document "${file.name}" vérifié et synchronisé avec succès.`);
      setTimeout(() => setSuccessNotice(null), 4000);

      if (onDossierUpdated) {
        onDossierUpdated();
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du document:', err);
      alert(`Erreur lors de l'enregistrement du document : ${err.message || err}`);
    } finally {
      setProcessingType(null);
    }
  };

  /**
   * Génération et vérification en un clic d'une pièce synthétique conforme
   */
  const handleGenerateSynthetic = async (docType: DocumentType) => {
    try {
      setProcessingType(docType);
      const file = await generateSyntheticDocument(docType, {
        id: user.id,
        nomCourt: user.nomCourt,
        badge: user.badge,
        tagline: user.projet.objet_projet,
        demandeur: user.demandeur,
        projet: user.projet,
        budget: user.budget,
        syntheticDocs: {
          rib: {
            banque: 'ATTIJARIWAFA BANK',
            titulaire: user.demandeur.nom_ou_raison_sociale,
            ice: user.demandeur.siret,
            iban: 'MA64 0077 8000 0123 4567 8901 42',
            bic: 'BCMAMAMC',
            ville: user.demandeur.ville
          },
          devis: {
            fournisseur: 'FOURNISSEUR EQUIPEMENT SARL',
            iceFournisseur: '001987654000088',
            totalHT: 120000,
            tva: 24000,
            totalTTC: 144000,
            designation: 'Équipements et matériel d\'exploitation'
          },
          cnss: {
            numAffiliation: '7654321',
            cotisations: '24 500,00 MAD'
          }
        }
      });

      await handleFileProcess(file, docType);
    } catch (err) {
      console.error('Erreur génération pièce:', err);
      setProcessingType(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-sand-300 shadow-card p-6 sm:p-7 space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-terracotta-600" />
            Répertoire des pièces justificatives du dossier
          </h2>
          <p className="text-xs text-sand-500 mt-0.5">
            Gérez, remplacez ou complétez vos documents ({existingPieces.length} déposée(s), {missingTypes.length} manquante(s)).
          </p>
        </div>

        {missingTypes.length > 0 && onTriggerComplement && (
          <button
            type="button"
            onClick={onTriggerComplement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-gold-600" />
            <span>Régulariser les pièces ({missingTypes.length})</span>
          </button>
        )}
      </div>

      {successNotice && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-sand-100 text-sand-600 uppercase tracking-wider font-semibold border-b border-sand-300">
            <tr>
              <th className="py-3 px-4">Document / Intitulé</th>
              <th className="py-3 px-4">Type de pièce</th>
              <th className="py-3 px-4">Statut OCR</th>
              <th className="py-3 px-4">Contrôles clés</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {/* 1. Pièces déjà déposées */}
            {existingPieces.map((piece, idx) => {
              const def = getDocumentTypeDefinition(piece.type_declare);
              const isProcessing = processingType === piece.type_declare;

              return (
                <tr key={idx} className="hover:bg-sand-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-xs font-semibold text-indigo-950" title={piece.nom_fichier}>
                        {piece.nom_fichier}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">
                      {def?.label || piece.type_declare}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      Vérifié & Conforme
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="flex flex-wrap gap-1.5">
                      {piece.champs_detectes?.siret && (
                        <span className="bg-sand-200 text-indigo-950 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                          ICE: {piece.champs_detectes.siret}
                        </span>
                      )}
                      {piece.champs_detectes?.iban && (
                        <span className="bg-sand-200 text-indigo-950 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                          IBAN validé
                        </span>
                      )}
                      {piece.champs_detectes?.montant && (
                        <span className="bg-sand-200 text-indigo-950 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                          {piece.champs_detectes.montant}
                        </span>
                      )}
                      {!piece.champs_detectes?.siret && !piece.champs_detectes?.iban && !piece.champs_detectes?.montant && (
                        <span className="text-sand-500 italic">Signature / texte conforme</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPiece(piece)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sand-200 hover:bg-sand-300 text-indigo-950 text-xs font-semibold transition-colors cursor-pointer"
                        title="Consulter les données extraites du document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Consulter</span>
                      </button>

                      <label
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sand-300 bg-white hover:bg-sand-100 text-indigo-950 text-xs font-bold transition-colors cursor-pointer ${
                          isProcessing ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        title="Remplacer cette pièce par une nouvelle version numérisée"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta-600" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-sand-600" />
                        )}
                        <span>{isProcessing ? 'Analyse...' : 'Remplacer'}</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={isProcessing}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileProcess(file, piece.type_declare);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* 2. Pièces manquantes déclarées */}
            {missingTypes.map((typeKey) => {
              const def = getDocumentTypeDefinition(typeKey);
              const isProcessing = processingType === typeKey;

              return (
                <tr key={typeKey} className="bg-amber-50/50 hover:bg-amber-50/80 transition-colors border-l-2 border-l-amber-500">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-amber-950">
                        {def?.label || typeKey}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-amber-900">
                      {def?.label || typeKey}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Manquante
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-amber-900 text-[11px]">
                    Pièce obligatoire requise pour l'instruction
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors ${
                          isProcessing ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        title="Téléverser et faire vérifier cette pièce manquante"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessing ? 'OCR...' : 'Téléverser'}</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={isProcessing}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileProcess(file, typeKey);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleGenerateSynthetic(typeKey)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gold-100 hover:bg-gold-200 text-gold-950 border border-gold-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        title="Générer en 1 clic un document conforme de démonstration"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gold-700" />
                        <span className="hidden sm:inline">1-Clic Démo</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal d'aperçu du texte OCR de la pièce */}
      {selectedPiece && (
        <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-sand-50 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-sand-300 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-terracotta-600" />
                <h3 className="font-bold text-indigo-950 text-sm">
                  Détail OCR : {selectedPiece.nom_fichier}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPiece(null)}
                className="text-sand-500 hover:text-indigo-950 text-sm font-bold px-2 py-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-sand-600 uppercase">Texte brut extrait par le navigateur :</span>
              <pre className="text-[11px] bg-white border border-sand-300 rounded-xl p-3 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-indigo-950">
                {selectedPiece.texte_ocr || 'Aucun texte extrait (image ou signature sans typographie standard)'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPiece(null)}
                className="px-4 py-2 bg-sand-200 hover:bg-sand-300 rounded-xl text-xs font-bold text-indigo-950 cursor-pointer"
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
