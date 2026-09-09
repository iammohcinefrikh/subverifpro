import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SparklesIcon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Search01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"

interface AiSynthesisProps {
  aiAnalysis: DossierDetailData["aiAnalysis"]
}

export function AiSynthesis({ aiAnalysis }: AiSynthesisProps) {
  if (!aiAnalysis) {
    return (
      <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
              Synthèse IA & Aide à la décision
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-muted-foreground">
          Aucune analyse d'intelligence artificielle n'a encore été générée pour ce dossier.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs bg-linear-to-b from-card to-stone-50/30 dark:to-stone-900/30">
      <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 flex items-center justify-center">
            <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} />
          </div>
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Synthèse IA & Recommandations
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          {aiAnalysis.recommendation && (
            <Badge variant="outline" className="border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
              {aiAnalysis.recommendation}
            </Badge>
          )}
          {aiAnalysis.modelName && (
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
              Modèle: {aiAnalysis.modelName}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Résumé exécutif */}
        {aiAnalysis.summary && (
          <div className="p-3 rounded-md bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 leading-relaxed text-stone-800 dark:text-stone-200">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Résumé synthétique
            </span>
            {aiAnalysis.summary}
          </div>
        )}

        {/* Scores & Cohérence budgétaire */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-md border border-stone-200/60 dark:border-stone-800 bg-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Qualité du projet
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                {aiAnalysis.qualityScore !== null ? `${aiAnalysis.qualityScore} / 100` : "—"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${aiAnalysis.qualityScore || 0}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-md border border-stone-200/60 dark:border-stone-800 bg-card">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              Cohérence budgétaire : <strong className="text-stone-900 dark:text-stone-100">{aiAnalysis.budgetCoherence || "Évaluée"}</strong>
            </span>
            <p className="text-[11px] text-muted-foreground truncate">
              {aiAnalysis.budgetComment || "Aucune anomalie flagrante détectée."}
            </p>
          </div>
        </div>

        {/* Risques, Forces & Points de vigilance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Forces */}
          <div className="p-3 rounded-md border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600" />
              <span>Points forts ({aiAnalysis.strengths.length})</span>
            </div>
            <ul className="space-y-1 text-[11px] text-emerald-950 dark:text-emerald-200">
              {aiAnalysis.strengths.length === 0 ? (
                <li className="text-muted-foreground italic">Non spécifié</li>
              ) : (
                aiAnalysis.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Risques */}
          <div className="p-3 rounded-md border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
              <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-rose-600" />
              <span>Risques identifiés ({aiAnalysis.risks.length})</span>
            </div>
            <ul className="space-y-1 text-[11px] text-rose-950 dark:text-rose-200">
              {aiAnalysis.risks.length === 0 ? (
                <li className="text-muted-foreground italic">Aucun risque majeur</li>
              ) : (
                aiAnalysis.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Points de vigilance */}
          <div className="p-3 rounded-md border border-blue-200/70 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300">
              <HugeiconsIcon icon={Search01Icon} size={14} className="text-blue-600" />
              <span>À vérifier ({aiAnalysis.focusPoints.length})</span>
            </div>
            <ul className="space-y-1 text-[11px] text-blue-950 dark:text-blue-200">
              {aiAnalysis.focusPoints.length === 0 ? (
                <li className="text-muted-foreground italic">Aucun point critique</li>
              ) : (
                aiAnalysis.focusPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
