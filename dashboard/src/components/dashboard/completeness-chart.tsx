import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompletenessDistributionItem } from "@/lib/queries/dashboard"

interface CompletenessChartProps {
  data: CompletenessDistributionItem[]
}

export function CompletenessChart({ data }: CompletenessChartProps) {
  const colors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ]

  return (
    <Card className="h-[320px] p-4 flex flex-col justify-between border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Aperçu de la complétude
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Taux de pièces
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-around py-1">
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={item.range} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${colors[idx % colors.length]}`} />
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {item.range}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-muted-foreground">{item.percentage}%</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    ({item.count})
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
