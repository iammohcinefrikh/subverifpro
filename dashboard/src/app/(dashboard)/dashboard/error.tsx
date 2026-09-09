"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-card">
      <div className="size-10 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
        <HugeiconsIcon icon={AlertCircleIcon} size={20} strokeWidth={2} />
      </div>
      <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        Erreur lors du chargement des données
      </h2>
      <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
        Impossible de charger les données du tableau de bord. Vérifiez la connexion à votre base de données PostgreSQL.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => reset()}
        className="h-8 text-xs gap-1.5"
      >
        <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={2} />
        Réessayer
      </Button>
    </div>
  )
}
