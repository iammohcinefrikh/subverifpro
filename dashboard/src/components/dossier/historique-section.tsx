import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  Activity01Icon,
  CheckmarkCircle02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

interface HistoriqueSectionProps {
  history: DossierDetailData["history"]
}

export function HistoriqueSection({ history }: HistoriqueSectionProps) {
  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Activity01Icon} size={16} className="text-stone-700 dark:text-stone-300" />
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Historique opérationnel du dossier
          </CardTitle>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {history.length} événement{history.length > 1 ? "s" : ""}
        </span>
      </CardHeader>

      <CardContent className="p-4">
        {history.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Aucun événement d'instruction enregistré pour le moment.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-stone-200 dark:before:bg-stone-800">
            {history.map((event) => (
              <div key={event.id} className="relative text-xs">
                {/* Timeline node */}
                <div className="absolute -left-6 top-0.5 size-4 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 flex items-center justify-center">
                  <div className="size-1.5 rounded-full bg-primary" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono h-4.5 px-1.5 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                      {event.eventType}
                    </Badge>
                    <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                      Par {event.userName}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    {event.createdAt}
                  </span>
                </div>

                <p className="text-stone-800 dark:text-stone-200 mt-1 leading-snug">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
