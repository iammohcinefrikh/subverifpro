import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"

interface AiSynthesisProps {
  aiAnalysis: DossierDetailData["aiAnalysis"]
}

const sectionTitleClass = "text-[10px] font-semibold uppercase tracking-wider"
const valueClass = "text-xs leading-relaxed"

export function AiSynthesis({ aiAnalysis }: AiSynthesisProps) {
  if (!aiAnalysis) {
    return (
      <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
        <CardHeader className="p-4 pb-2! border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
              Synthèse IA & Aide à la décision
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-6 text-center text-xs text-muted-foreground">
          Aucune analyse d&apos;intelligence artificielle n&apos;a encore été générée pour ce dossier.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative border border-stone-200 dark:border-stone-800 shadow-xs">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-purple-50 via-purple-50/40 to-transparent dark:from-purple-950/60 dark:via-purple-950/25"
      />
      <CardHeader className="relative p-4 pb-2! flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 flex items-center justify-center">
            <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} />
          </div>
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Synthèse IA & Recommandations
          </CardTitle>
        </div>

        {aiAnalysis.recommendation && (
          <Badge variant="outline" className="border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
            {aiAnalysis.recommendation}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="relative pb-4 space-y-4 text-xs">
        {/* Résumé exécutif */}
        {aiAnalysis.summary && (
          <div className={`${valueClass} text-stone-900 dark:text-stone-100`}>
            <span className={`${sectionTitleClass} text-muted-foreground block mb-1`}>
              Résumé synthétique
            </span>
            {aiAnalysis.summary}
          </div>
        )}

        {aiAnalysis.summary && <Separator />}

        {/* Scores & Cohérence budgétaire */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-x-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className={`${sectionTitleClass} text-muted-foreground`}>
                Qualité du projet
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                {aiAnalysis.qualityScore !== null ? `${aiAnalysis.qualityScore}/100` : "—"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${aiAnalysis.qualityScore || 0}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className={`${sectionTitleClass} text-muted-foreground`}>
                Cohérence budgétaire
              </span>
              <strong className="text-right text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                {aiAnalysis.budgetCoherence || "Évaluée"}
              </strong>
            </div>
            <p className={`${valueClass} text-stone-900 dark:text-stone-100`}>
              {aiAnalysis.budgetComment || "Aucune anomalie flagrante détectée."}
            </p>
          </div>
        </div>

        <Separator />

        {/* Risques, Forces & Points de vigilance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Forces */}
          <div className="space-y-2.5">
            <div className={`${sectionTitleClass} text-emerald-700 dark:text-emerald-300`}>
              Points forts
            </div>
            <ul className={`space-y-0.5 ${valueClass} text-emerald-900 dark:text-emerald-100`}>
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
          <div className="space-y-2.5">
            <div className={`${sectionTitleClass} text-rose-700 dark:text-rose-300`}>
              Risques identifiés
            </div>
            <ul className={`space-y-0.5 ${valueClass} text-rose-900 dark:text-rose-100`}>
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
          <div className="space-y-2.5">
            <div className={`${sectionTitleClass} text-yellow-700 dark:text-yellow-300`}>
              À vérifier
            </div>
            <ul className={`space-y-0.5 ${valueClass} text-yellow-900 dark:text-yellow-100`}>
              {aiAnalysis.focusPoints.length === 0 ? (
                <li className="text-muted-foreground italic">Aucun point critique</li>
              ) : (
                aiAnalysis.focusPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-yellow-600 font-bold">•</span>
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
