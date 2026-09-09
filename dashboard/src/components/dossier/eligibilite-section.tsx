import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons"

interface EligibiliteSectionProps {
  eligibility: DossierDetailData["eligibility"]
}

export function EligibiliteSection({ eligibility }: EligibiliteSectionProps) {
  const isEligible = eligibility.result === "ELIGIBLE"
  const isRejected = eligibility.result === "NON_ELIGIBLE"

  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-stone-700 dark:text-stone-300" />
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Éligibilité réglementaire
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            Score: <strong className="text-stone-900 dark:text-stone-100">{eligibility.score} / 100</strong>
          </span>
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold ${
              isEligible
                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : isRejected
                ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                : "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
            }`}
          >
            {eligibility.resultLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Failed Criteria Warning Box */}
        {eligibility.failedCriteria.length > 0 && (
          <div className="p-3 rounded-md border border-rose-200 dark:border-rose-800/80 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
              <HugeiconsIcon icon={AlertCircleIcon} size={14} />
              <span>Critères non validés ({eligibility.failedCriteria.length})</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
              {eligibility.failedCriteria.map((fc, i) => (
                <li key={i} className="font-mono">{fc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Criteria Evaluation List */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Évaluation détaillée des critères
          </h4>

          <div className="space-y-1.5 max-h-65 overflow-y-auto pr-1">
            {eligibility.checks.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                Aucun critère spécifique évalué pour ce dossier.
              </div>
            ) : (
              eligibility.checks.map((chk) => {
                const passed = chk.status?.toUpperCase() === "PASSED" || chk.status?.toUpperCase() === "VALIDE"
                const failed = chk.status?.toUpperCase() === "FAILED" || chk.status?.toUpperCase() === "NON_VALIDE"

                return (
                  <div
                    key={chk.id}
                    className="flex items-start justify-between p-2.5 rounded-md border border-stone-200/60 dark:border-stone-800 bg-card gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {passed ? (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-600" />
                        ) : failed ? (
                          <HugeiconsIcon icon={Cancel01Icon} size={15} className="text-rose-600" />
                        ) : (
                          <HugeiconsIcon icon={AlertCircleIcon} size={15} className="text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-stone-900 dark:text-stone-100 block">
                          {chk.criterionLabel}
                        </span>
                        {chk.detail && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {chk.detail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1 font-mono">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4.5 px-1.5 font-medium ${
                          passed
                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                            : failed
                            ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                            : "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {chk.status}
                      </Badge>
                      {chk.pointsAwarded !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          +{chk.pointsAwarded} pts
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
