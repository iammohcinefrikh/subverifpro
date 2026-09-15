"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DossierActions } from "@/components/dossier/dossier-actions"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { statusBadgeClass } from "@/lib/status-tone"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons"

interface DossierHeaderProps {
  data: DossierDetailData
  /** Where the back button returns to, derived from the `from` search param. */
  backHref: string
  backLabel: string
}

export function DossierHeader({ data, backHref, backLabel }: DossierHeaderProps) {
  const { application } = data

  const renderPriorityBadge = () => {
    switch (application.priority.level) {
      case "HAUTE":
        return (
          <Badge variant="outline" className="h-7 px-2.5 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 gap-1 text-xs">
            <HugeiconsIcon icon={AlertCircleIcon} size={13} strokeWidth={2.5} />
            <span>Priorité Haute</span>
          </Badge>
        )
      case "MOYENNE":
        return (
          <Badge variant="outline" className="h-7 px-2.5 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 gap-1 text-xs">
            <HugeiconsIcon icon={AlertCircleIcon} size={13} strokeWidth={2} />
            <span>Priorité Moyenne</span>
          </Badge>
        )
      case "BASSE":
        return (
          <Badge variant="outline" className="h-7 px-2.5 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 gap-1 text-xs">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} strokeWidth={2} />
            <span>Priorité Normale</span>
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon-sm"
          className="size-8 rounded-lg border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
        >
          <Link href={backHref} title={`Retour à ${backLabel}`}>
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={2} />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
            {application.reference}
          </h1>
          <Badge
            variant="outline"
            className={`h-7 px-2.5 text-xs font-semibold ${statusBadgeClass(application.status)}`}
          >
            {application.statusLabel}
          </Badge>
          {renderPriorityBadge()}
        </div>
      </div>

      <DossierActions
        applicationId={application.applicationId}
        reference={application.reference}
        status={application.status}
      />
    </div>
  )
}