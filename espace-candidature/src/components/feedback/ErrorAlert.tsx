import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle, CheckCircle, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorAlertProps {
  message: string;
  statusCode?: number;
  onRetry: () => void;
  onSimulateSuccess?: () => void;
  onToggleEditUrl?: () => void;
  isLoading?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  statusCode,
  onRetry,
  onSimulateSuccess,
  onToggleEditUrl,
  isLoading = false
}) => {
  return (
    <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-left space-y-4 animate-fadeIn shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-rose-950">
            Retour d'erreur du Webhook externe {statusCode ? `(Code HTTP ${statusCode})` : ''}
          </h4>
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-white/85 rounded-xl border border-rose-200 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Diagnostic & Solutions :</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px] leading-relaxed">
          {statusCode === 404 && (
            <li>
              <strong>Point de terminaison non actif (404) :</strong> Le chemin d'orchestration <code>/condidat</code> sur <code>stg-orch-api.abafusion.ai</code> indique qu'aucun workflow n'est actuellement déployé sur cette URL.
            </li>
          )}
          <li>
            <strong>Tester avec une URL active :</strong> Vous pouvez renseigner votre propre URL webhook (ex. créée gratuitement en 1 clic sur <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline font-semibold">webhook.site</a>).
          </li>
          <li>
            <strong>Mode démonstrateur :</strong> Pour continuer la recette et tester l'écran de confirmation, la génération du récépissé PDF et le téléchargement du JSON complet, cliquez sur <em>"Valider en mode démonstrateur"</em>.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {onToggleEditUrl && (
          <button
            type="button"
            onClick={onToggleEditUrl}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 cursor-pointer underline"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            Modifier l'URL du webhook
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {onSimulateSuccess && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onSimulateSuccess}
              leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              className="border border-slate-300"
            >
              Valider en mode démo (Récépissé)
            </Button>
          )}

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onRetry}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
};
