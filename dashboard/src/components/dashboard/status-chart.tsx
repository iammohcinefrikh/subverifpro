import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatusDistributionItem } from "@/lib/queries/dashboard"

interface StatusChartProps {
  data: StatusDistributionItem[]
  total: number
}

export function StatusChart({ data, total }: StatusChartProps) {
  const safeTotal = total > 0 ? total : 1

  return (
    <Card className="h-[320px] p-4 flex flex-col justify-between border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Dossiers par statut
          </CardTitle>
          <span className="text-[11px] font-mono text-muted-foreground">
            {total} au total
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-around py-1">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            Aucun dossier enregistré
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.map((item) => {
              const pct = Math.round((item.count / safeTotal) * 100)
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 dark:text-stone-300 truncate">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
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
