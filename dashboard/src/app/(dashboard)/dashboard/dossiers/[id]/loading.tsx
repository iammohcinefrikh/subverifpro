import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const cardClass = "border border-stone-200 dark:border-stone-800 shadow-xs"
const headerClass =
  "p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between"
const tileClass =
  "p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800"

export default function DossierDetailLoading() {
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header: back button, reference/status, completeness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-lg bg-stone-200/80 dark:bg-stone-800" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-6 w-32 rounded font-mono bg-stone-200 dark:bg-stone-800" />
              <Skeleton className="h-5 w-20 rounded-full bg-stone-200/70 dark:bg-stone-800" />
              <Skeleton className="h-5 w-24 rounded-full bg-stone-200/70 dark:bg-stone-800" />
            </div>
            <Skeleton className="h-3.5 w-72 rounded bg-stone-200/60 dark:bg-stone-850" />
          </div>
        </div>
        <Skeleton className="h-7 w-36 rounded-md bg-stone-200/80 dark:bg-stone-800" />
      </div>

      {/* 2. Informations du demandeur & projet */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
            <Skeleton className="h-4 w-56 rounded bg-stone-200 dark:bg-stone-800" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Identité & coordonnées */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-44 rounded bg-stone-200/60 dark:bg-stone-850" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`${tileClass} space-y-1`}>
                  <Skeleton className="h-2.5 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
                  <Skeleton className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Structure & activité */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-40 rounded bg-stone-200/60 dark:bg-stone-850" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${tileClass} space-y-1`}>
                  <Skeleton className="h-2.5 w-20 rounded bg-stone-200/60 dark:bg-stone-850" />
                  <Skeleton className="h-4 w-28 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Projet & budget */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-36 rounded bg-stone-200/60 dark:bg-stone-850" />
            <div className="p-3 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 space-y-2.5">
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-24 rounded bg-stone-200/60 dark:bg-stone-850" />
                <Skeleton className="h-4 w-full rounded bg-stone-200 dark:bg-stone-800" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-2.5 w-20 rounded bg-stone-200/60 dark:bg-stone-850" />
                    <Skeleton className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Complétude & Éligibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complétude */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className="h-4 w-40 rounded bg-stone-200 dark:bg-stone-800" />
            </div>
            <Skeleton className="h-4 w-10 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-2 w-full rounded-full bg-stone-200/80 dark:bg-stone-800" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              ))}
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-32 rounded bg-stone-200/60 dark:bg-stone-850" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Éligibilité */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className="h-4 w-44 rounded bg-stone-200 dark:bg-stone-800" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full bg-stone-200/70 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-16 w-full rounded-md bg-stone-200/60 dark:bg-stone-850" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-40 rounded bg-stone-200/60 dark:bg-stone-850" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Compléments & Synthèse IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compléments */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className="h-4 w-44 rounded bg-stone-200 dark:bg-stone-800" />
            </div>
            <Skeleton className="h-3 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg bg-stone-200/70 dark:bg-stone-800" />
            ))}
          </CardContent>
        </Card>

        {/* Synthèse IA */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className="h-4 w-44 rounded bg-stone-200 dark:bg-stone-800" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-stone-200/70 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-16 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-14 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              <Skeleton className="h-14 rounded-md bg-stone-200/60 dark:bg-stone-850" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Historique */}
      <Card className={cardClass}>
        <CardHeader className={headerClass}>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
            <Skeleton className="h-4 w-52 rounded bg-stone-200 dark:bg-stone-800" />
          </div>
          <Skeleton className="h-3 w-12 rounded bg-stone-200/60 dark:bg-stone-850" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-4 shrink-0 rounded-full bg-stone-200/80 dark:bg-stone-800" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24 rounded-full bg-stone-200/70 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-20 rounded bg-stone-200/60 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-3.5 w-full rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
