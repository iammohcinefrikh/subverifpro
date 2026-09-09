import React from 'react';
import type { WebhookDossierPayload } from '../../types/webhook';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  Printer,
  Download,
  Copy,
  Check,
  RefreshCw,
  Building2,
  FileCheck2,
  Calendar,
  Coins
} from 'lucide-react';

interface ConfirmationModalProps {
  payload: WebhookDossierPayload;
  onReset: () => void;
  onGoToDashboard?: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ payload, onReset, onGoToDashboard }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(payload.dossier_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dossier_subvention_${payload.dossier_id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formattedDate = new Date(payload.date_soumission).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-elevation max-w-4xl w-full p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header Badge */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Candidature Enregistrée & Transmise
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Récépissé de Dépôt de Demande de Subvention
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Votre dossier complet et les pièces justificatives numérisées ont été transmis au service de vérification préalable.
          </p>
        </div>

        {/* Dossier ID & Timestamp Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Identifiant unique du dossier (UUID)
            </span>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-mono text-sm sm:text-base font-bold text-brand-300">
                {payload.dossier_id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors no-print"
                title="Copier l'identifiant"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Horodatage certifié
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Recap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Demandeur */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              Demandeur & Représentant
            </h3>
            <p className="text-sm font-bold text-slate-900">
              {payload.demandeur.nom_ou_raison_sociale}
            </p>
            <p className="text-xs text-slate-600">
              ICE / SIRET : <span className="font-mono">{payload.demandeur.siret}</span> • {payload.demandeur.structure_type}
            </p>
            <div className="pt-1.5 border-t border-slate-200/70 text-xs text-slate-700 space-y-0.5">
              <p className="font-semibold text-slate-900">
                {payload.demandeur.prenom_representant} {payload.demandeur.nom_representant}
                {payload.demandeur.cin_representant && (
                  <span className="font-mono text-brand-700 font-normal ml-1.5">
                    (CIN : {payload.demandeur.cin_representant})
                  </span>
                )}
                {payload.demandeur.date_naissance_representant && (
                  <span className="text-slate-500 font-normal ml-1.5">
                    • Né(e) le {payload.demandeur.date_naissance_representant}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500">
                {payload.demandeur.email_representant} • {payload.demandeur.telephone_representant}
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              {payload.demandeur.adresse}, {payload.demandeur.code_postal} {payload.demandeur.ville} ({payload.demandeur.region})
            </p>
          </div>

          {/* Projet */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              Projet & Calendrier
            </h3>
            <p className="text-sm font-bold text-slate-900 line-clamp-1">
              {payload.projet.objet_projet}
            </p>
            <p className="text-xs text-slate-600">
              Du {payload.projet.date_debut} au {payload.projet.date_fin}
            </p>
            <p className="text-xs text-slate-500 line-clamp-2">
              {payload.projet.description}
            </p>
          </div>

          {/* Budget */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-600" />
              Budget & Demande
            </h3>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Coût total opération :</span>
              <span className="font-bold text-slate-900">{payload.budget.montant_total.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-700 font-semibold">Subvention sollicitée :</span>
              <span className="font-bold text-brand-700 text-sm">{payload.budget.montant_demande.toLocaleString('fr-FR')} €</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              {payload.budget.depenses.length} poste(s) de dépense • {payload.budget.financements.length} source(s) de financement
            </p>
          </div>

          {/* Pièces */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-brand-600" />
              Pièces Justificatives ({payload.pieces.length})
            </h3>
            <ul className="text-xs space-y-1.5 max-h-24 overflow-y-auto">
              {payload.pieces.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between text-slate-700">
                  <span className="truncate max-w-[200px]" title={p.nom_fichier}>
                    • {p.nom_fichier}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {p.type_declare}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
          <p className="font-bold">Mention légale :</p>
          <p className="leading-relaxed">
            La délivrance de ce récépissé atteste uniquement de la bonne réception technique de vos pièces et données. Il ne préjuge en aucun cas de la conformité réglementaire finale ou de l'octroi d'une quelconque subvention.
          </p>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 no-print">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Déposer une nouvelle candidature
          </Button>

          <div className="flex items-center gap-3">
            {onGoToDashboard && (
              <Button
                type="button"
                variant="primary"
                onClick={onGoToDashboard}
                leftIcon={<FileCheck2 className="w-4 h-4" />}
              >
                Accéder à mon espace candidat
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={handleDownloadJson}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Télécharger le JSON transmis
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Imprimer le récépissé (PDF)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
