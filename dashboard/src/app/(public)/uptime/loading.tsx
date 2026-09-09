import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function UptimeLoading() {
  return (
    <div className="min-h-screen bg-stone-50/40 dark:bg-stone-950 p-4 sm:p-8 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg bg-stone-200/80 dark:bg-stone-800" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-48 rounded bg-stone-200 dark:bg-stone-800" />
              <Skeleton className="h-3.5 w-64 rounded bg-stone-200/60 dark:bg-stone-850" />
            </div>
          </div>
          <Skeleton className="h-10 w-44 rounded-full bg-stone-200/80 dark:bg-stone-800" />
        </div>

        {/* 4 Service Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-[105px] p-4 border border-stone-200 dark:border-stone-800">
              <CardContent className="p-0 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded bg-stone-200 dark:bg-stone-800" />
                  <Skeleton className="size-2.5 rounded-full bg-stone-200 dark:bg-stone-800" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <Skeleton className="h-6 w-16 rounded font-mono bg-stone-200 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Execution Gates */}
        <Card className="border border-stone-200 dark:border-stone-800">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800">
            <Skeleton className="h-4 w-52 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-md bg-stone-200/60 dark:bg-stone-850" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Error Logs */}
        <Card className="border border-stone-200 dark:border-stone-800">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800">
            <Skeleton className="h-4 w-44 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md bg-stone-200/60 dark:bg-stone-850" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
