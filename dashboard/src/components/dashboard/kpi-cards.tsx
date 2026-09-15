import type { ComponentProps } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardKPIs } from "@/lib/queries/dashboard"
import { TONE_CLASSES, type StatusTone } from "@/lib/status-tone"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InboxIcon,
  CheckmarkCircle02Icon,
  FileValidationIcon,
  Time02Icon,
  Award01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"

interface KpiCardsProps {
  kpis: DashboardKPIs
}

interface KpiCard {
  title: string
  value: number
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  /** Tone shared with the matching status badge / action button. */
  tone: StatusTone
  /** Extra emphasis reserved for the urgent card. */
  extra?: string
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards: KpiCard[] = [
    {
      title: "Dossiers reçus",
      value: kpis.totalApplications,
      icon: InboxIcon,
      tone: "stone",
    },
    {
      // CONFORME
      title: "Dossiers complets",
      value: kpis.completedDossiers,
      icon: CheckmarkCircle02Icon,
      tone: "emerald",
    },
    {
      // INCOMPLETE
      title: "Dossiers incomplets",
      value: kpis.incompleteDossiers,
      icon: FileValidationIcon,
      tone: "amber",
    },
    {
      // PENDING
      title: "Dossiers en traitement",
      value: kpis.pendingDossiers,
      icon: Time02Icon,
      tone: "blue",
    },
    {
      // Eligibility PASS
      title: "Dossiers éligibles",
      value: kpis.eligibleDossiers,
      icon: Award01Icon,
      tone: "teal",
    },
    {
      // Priority HAUTE (project starts within 10 days)
      title: "Dossiers urgents",
      value: kpis.urgentDossiers,
      icon: Alert02Icon,
      tone: "rose",
      extra: "ring-1 ring-rose-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const tone = TONE_CLASSES[card.tone]

        return (
          <Card
            key={card.title}
            className={`h-24 p-3 border shadow-xs transition-all hover:shadow-sm ${tone.border} ${card.extra ?? ""}`}
          >
            <CardContent className="p-0 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-medium text-muted-foreground truncate" title={card.title}>
                  {card.title}
                </span>
                <div className={`size-6 rounded-md flex items-center justify-center shrink-0 ${tone.chip} ${tone.accent}`}>
                  <HugeiconsIcon icon={card.icon} size={14} strokeWidth={2} />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
                  {card.value}
                </span>
                {card.tone === "rose" && card.value > 0 && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${TONE_CLASSES.rose.chip} ${TONE_CLASSES.rose.accent}`}>
                    &lt; 10j
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}