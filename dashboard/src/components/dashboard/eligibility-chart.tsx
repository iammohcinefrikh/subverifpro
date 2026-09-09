import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EligibilityDistributionItem } from "@/lib/queries/dashboard"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  AlertCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

interface EligibilityChartProps {
  data: EligibilityDistributionItem[]
}

export function EligibilityChart({ data }: EligibilityChartProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0)
  const safeTotal = total > 0 ? total : 1

  const getIcon = (result: string) => {
    switch (result.toUpperCase()) {
      case "ELIGIBLE":
        return { icon: CheckmarkCircle02Icon, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" }
      case "NON_ELIGIBLE":
        return { icon: Cancel01Icon, color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40" }
      case "A_REVOIR":
      case "ATTENTION":
        return { icon: AlertCircleIcon, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" }
      default:
        return { icon: Search01Icon, color: "text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800" }
    }
  }

  return (
    <Card className="h-[320px] p-4 flex flex-col justify-between border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Aperçu de l'éligibilité
          </CardTitle>
          <span className="text-[11px] font-mono text-muted-foreground">
            {total} évalués
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-around py-1">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            Aucune évaluation enregistrée
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const { icon, color } = getIcon(item.result)
              const pct = Math.round((item.count / safeTotal) * 100)
              return (
                <div key={item.result} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`size-5 rounded flex items-center justify-center ${color}`}>
                        <HugeiconsIcon icon={icon} size={13} strokeWidth={2} />
                      </div>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-muted-foreground">{pct}%</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        ({item.count})
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
