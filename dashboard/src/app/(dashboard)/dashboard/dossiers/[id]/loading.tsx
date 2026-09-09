import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DossierDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg bg-stone-200/80 dark:bg-stone-800" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32 rounded font-mono bg-stone-200 dark:bg-stone-800" />
              <Skeleton className="h-5 w-20 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className="h-5 w-24 rounded bg-stone-200/60 dark:bg-stone-850" />
            </div>
            <Skeleton className="h-3.5 w-64 rounded bg-stone-200/60 dark:bg-stone-850" />
          </div>
        </div>
        <Skeleton className="h-7 w-32 rounded-md bg-stone-200/80 dark:bg-stone-800" />
      </div>

      {/* Demandeur Info Skeleton */}
      <Card className="border border-stone-200 dark:border-stone-800">
        <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80">
          <Skeleton className="h-4 w-56 rounded bg-stone-200 dark:bg-stone-800" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-md border border-stone-100 dark:border-stone-800/80 space-y-1">
                <Skeleton className="h-2.5 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
                <Skeleton className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-md border border-stone-100 dark:border-stone-800/80 space-y-1">
                <Skeleton className="h-2.5 w-20 rounded bg-stone-200/60 dark:bg-stone-850" />
                <Skeleton className="h-4 w-28 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Grid: Complétude & Éligibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complétude Skeleton */}
        <Card className="border border-stone-200 dark:border-stone-800">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-44 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-4 w-12 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-2 w-full rounded-full bg-stone-200/80 dark:bg-stone-800" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              <Skeleton className="h-12 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              <Skeleton className="h-12 rounded-md bg-stone-200/60 dark:bg-stone-850" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Éligibilité Skeleton */}
        <Card className="border border-stone-200 dark:border-stone-800">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-48 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-5 w-24 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-12 w-full rounded-md bg-stone-200/60 dark:bg-stone-850" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Grid: Compléments & Synthèse IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compléments Skeleton */}
        <Card className="border border-stone-200 dark:border-stone-800">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-44 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-20 w-full rounded-lg bg-stone-200/70 dark:bg-stone-800" />
            <Skeleton className="h-20 w-full rounded-lg bg-stone-200/70 dark:bg-stone-800" />
          </CardContent>
        </Card>

        {/* Synthèse IA Skeleton */}
        <Card className="border border-stone-200 dark:border-stone-800">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-48 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-5 w-20 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-16 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              <Skeleton className="h-20 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              <Skeleton className="h-20 rounded-md bg-stone-200/60 dark:bg-stone-850" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique Skeleton */}
      <Card className="border border-stone-200 dark:border-stone-800">
        <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80">
          <Skeleton className="h-4 w-52 rounded bg-stone-200 dark:bg-stone-800" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md bg-stone-200/70 dark:bg-stone-800" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
