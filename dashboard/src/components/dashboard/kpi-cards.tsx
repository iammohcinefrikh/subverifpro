import { Card, CardContent } from "@/components/ui/card"
import type { DashboardKPIs } from "@/lib/queries/dashboard"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InboxIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Search01Icon,
  Clock01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"

interface KpiCardsProps {
  kpis: DashboardKPIs
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      title: "Demandes reçues",
      value: kpis.totalApplications,
      icon: InboxIcon,
      accent: "text-stone-700 dark:text-stone-300",
      bg: "bg-stone-100 dark:bg-stone-800/80",
      border: "border-stone-200 dark:border-stone-800",
    },
    {
      title: "Dossiers complets",
      value: kpis.completedDossiers,
      icon: CheckmarkCircle02Icon,
      accent: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
      border: "border-emerald-200/60 dark:border-emerald-900/40",
    },
    {
      title: "Dossiers incomplets",
      value: kpis.incompleteDossiers,
      icon: Cancel01Icon,
      accent: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50/80 dark:bg-rose-950/30",
      border: "border-rose-200/60 dark:border-rose-900/40",
    },
    {
      title: "Dossiers à vérifier",
      value: kpis.toVerifyDossiers,
      icon: Search01Icon,
      accent: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/80 dark:bg-amber-950/30",
      border: "border-amber-200/60 dark:border-amber-900/40",
    },
    {
      title: "Compléments en attente",
      value: kpis.pendingComplements,
      icon: Clock01Icon,
      accent: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/80 dark:bg-blue-950/30",
      border: "border-blue-200/60 dark:border-blue-900/40",
    },
    {
      title: "Dossiers urgents",
      value: kpis.urgentDossiers,
      icon: Alert02Icon,
      accent: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-300 dark:border-rose-800 ring-1 ring-rose-500/20",
      isUrgent: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`h-24 p-3 border shadow-xs transition-all hover:border-stone-300 dark:hover:border-stone-700 ${card.border}`}
        >
          <CardContent className="p-0 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-medium text-muted-foreground truncate" title={card.title}>
                {card.title}
              </span>
              <div className={`size-6 rounded-md flex items-center justify-center shrink-0 ${card.bg} ${card.accent}`}>
                <HugeiconsIcon icon={card.icon} size={14} strokeWidth={2} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
                {card.value}
              </span>
              {card.isUrgent && card.value > 0 && (
                <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-1.5 py-0.2 rounded">
                  &lt; 48h
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
