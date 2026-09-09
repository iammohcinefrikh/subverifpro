import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileValidationIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons"

interface CompletudeSectionProps {
  compliance: DossierDetailData["compliance"]
}

export function CompletudeSection({ compliance }: CompletudeSectionProps) {
  const rate = compliance.completenessRate

  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FileValidationIcon} size={16} className="text-stone-700 dark:text-stone-300" />
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Complétude du dossier
          </CardTitle>
        </div>
        <span className="font-mono text-xs font-bold text-primary">
          {rate}%
        </span>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Progress & Summary Metrics */}
        <div className="space-y-2">
          <Progress value={rate} className="h-2 bg-stone-100 dark:bg-stone-800" />

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-md bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium block">
                Fournis
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {compliance.presentCount}
              </span>
            </div>

            <div className="p-2 rounded-md bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-center">
              <span className="text-[10px] text-rose-800 dark:text-rose-300 font-medium block">
                Manquants
              </span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm">
                {compliance.missingCount}
              </span>
            </div>

            <div className="p-2 rounded-md bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium block">
                Expirés
              </span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                {compliance.expiredCount}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Document List */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Inventaire des pièces
          </h4>

          <div className="space-y-1.5 max-h-65 overflow-y-auto pr-1">
            {/* Missing Documents */}
            {compliance.missingDocuments.map((doc, idx) => (
              <div
                key={`missing-${idx}`}
                className="flex items-center justify-between p-2 rounded-md border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-rose-600 shrink-0" />
                  <span className="font-medium text-rose-900 dark:text-rose-200 truncate">
                    {doc.name}
                  </span>
                </div>
                <Badge variant="outline" className="border-rose-300 dark:border-rose-800 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] shrink-0 font-medium">
                  Manquant
                </Badge>
              </div>
            ))}

            {/* Expired Documents */}
            {compliance.expiredDocuments.map((doc, idx) => (
              <div
                key={`expired-${idx}`}
                className="flex items-center justify-between p-2 rounded-md border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-amber-600 shrink-0" />
                  <span className="font-medium text-amber-900 dark:text-amber-200 truncate">
                    {doc.name}
                  </span>
                </div>
                <Badge variant="outline" className="border-amber-300 dark:border-amber-800 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] shrink-0 font-medium">
                  Expiré
                </Badge>
              </div>
            ))}

            {/* Present Documents */}
            {compliance.presentDocuments.map((doc, idx) => (
              <div
                key={`present-${idx}`}
                className="flex items-center justify-between p-2 rounded-md border border-stone-200/60 dark:border-stone-800 bg-card text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-stone-800 dark:text-stone-200 truncate">
                    {doc.name}
                  </span>
                </div>
                <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] shrink-0 font-medium">
                  Fourni
                </Badge>
              </div>
            ))}

            {compliance.presentDocuments.length === 0 &&
              compliance.missingDocuments.length === 0 &&
              compliance.expiredDocuments.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Aucune vérification documentaire détaillée enregistrée.
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
