import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function StatistiquesLoading() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-64 rounded bg-stone-200 dark:bg-stone-800" />
        <Skeleton className="h-3.5 w-96 max-w-full rounded bg-stone-200/60 dark:bg-stone-800/60" />
      </div>

      {/* Global status banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-card shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl bg-stone-200/80 dark:bg-stone-800" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-56 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-72 max-w-full rounded bg-stone-200/60 dark:bg-stone-800/60" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-40 rounded-lg bg-stone-200/80 dark:bg-stone-800" />
          <Skeleton className="h-8 w-32 rounded-lg bg-stone-200/80 dark:bg-stone-800" />
        </div>
      </div>

      {/* 24h availability graph */}
      <Card className="border border-stone-200 dark:border-stone-800">
        <CardHeader className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800/80">
          <Skeleton className="h-4 w-64 rounded bg-stone-200 dark:bg-stone-800" />
        </CardHeader>
        <CardContent className="p-4 space-y-5">
          {Array.from({ length: 4 }).map((_, row) => (
            <div key={row} className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="md:w-64 shrink-0 space-y-1.5">
                <Skeleton className="h-3.5 w-36 rounded bg-stone-200 dark:bg-stone-800" />
                <Skeleton className="h-2.5 w-48 rounded bg-stone-200/60 dark:bg-stone-800/60" />
              </div>
              <div className="flex-1 flex items-end gap-0.5">
                {Array.from({ length: 24 }).map((_, pill) => (
                  <Skeleton
                    key={pill}
                    className="h-9 w-1.5 shrink-0 rounded-full bg-stone-200/80 dark:bg-stone-800"
                  />
                ))}
              </div>
              <Skeleton className="h-4 w-16 shrink-0 rounded bg-stone-200/60 dark:bg-stone-800/60" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pipeline execution times */}
      <Card className="border border-stone-200 dark:border-stone-800">
        <CardHeader className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800/80">
          <Skeleton className="h-4 w-72 rounded bg-stone-200 dark:bg-stone-800" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 rounded-lg bg-stone-200/60 dark:bg-stone-800/60"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incidents */}
      <Card className="border border-stone-200 dark:border-stone-800">
        <CardHeader className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800/80">
          <Skeleton className="h-4 w-56 rounded bg-stone-200 dark:bg-stone-800" />
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-full rounded-md bg-stone-200/60 dark:bg-stone-800/60"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}