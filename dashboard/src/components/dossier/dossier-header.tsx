"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons"

interface DossierHeaderProps {
  data: DossierDetailData
}

export function DossierHeader({ data }: DossierHeaderProps) {
  const { application, compliance } = data

  const renderPriorityBadge = () => {
    switch (application.priority.level) {
      case "HAUTE":
        return (
          <Badge variant="outline" className="border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 gap-1 text-xs">
            <HugeiconsIcon icon={AlertCircleIcon} size={13} strokeWidth={2.5} />
            <span>Priorité Haute</span>
          </Badge>
        )
      case "MOYENNE":
        return (
          <Badge variant="outline" className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 gap-1 text-xs">
            <HugeiconsIcon icon={AlertCircleIcon} size={13} strokeWidth={2} />
            <span>Priorité Moyenne</span>
          </Badge>
        )
      case "BASSE":
        return (
          <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 gap-1 text-xs">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} strokeWidth={2} />
            <span>Priorité Normale</span>
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon-sm"
          className="size-8 rounded-lg border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
        >
          <Link href="/dashboard" title="Retour au tableau de bord">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={2} />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
              {application.reference}
            </h1>
            <Badge variant="outline" className="border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold">
              {application.statusLabel}
            </Badge>
            {renderPriorityBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Demandeur: <strong className="text-stone-900 dark:text-stone-200">{application.fullName}</strong> — Programme: {application.programName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Badge variant="outline" className="h-7 text-xs font-mono border-stone-300 dark:border-stone-700 px-2.5">
          Complétude: <strong className="ml-1 text-primary">{compliance.completenessRate}%</strong>
        </Badge>
      </div>
    </div>
  )
}
