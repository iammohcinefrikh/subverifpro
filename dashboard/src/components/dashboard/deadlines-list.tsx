import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { UpcomingDeadlineItem } from "@/lib/queries/dashboard"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  Alert02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

interface DeadlinesListProps {
  deadlines: UpcomingDeadlineItem[]
}

export function DeadlinesList({ deadlines }: DeadlinesListProps) {
  return (
    <Card className="h-[320px] p-4 flex flex-col justify-between border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Clock01Icon} size={15} className="text-stone-700 dark:text-stone-300" />
            <CardTitle className="text-xs font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              Échéances à venir
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {deadlines.length} en attente
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        {deadlines.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Aucun délai de complément en cours
          </div>
        ) : (
          <ScrollArea className="h-[245px] pr-2">
            <div className="space-y-2">
              {deadlines.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/dossiers/${item.applicationId}`}
                  className="block p-2 rounded-md border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-card hover:bg-stone-50/80 dark:hover:bg-stone-900/60 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-primary transition-colors">
                          {item.applicantName}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {item.programName}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4.5 px-1.5 font-mono ${
                          item.isUrgent
                            ? "border-rose-300 dark:border-rose-800 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                            : "border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        {item.isUrgent ? (
                          <HugeiconsIcon icon={Alert02Icon} size={11} className="mr-0.5 inline" />
                        ) : null}
                        {item.daysLeft <= 0 ? "Aujourd'hui" : `J-${item.daysLeft}`}
                      </Badge>
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {item.deadline.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
