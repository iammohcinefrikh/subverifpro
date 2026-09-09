import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-48 rounded-md bg-stone-200/80 dark:bg-stone-800" />
        <Skeleton className="h-4 w-80 rounded bg-stone-200/60 dark:bg-stone-850" />
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-[96px] p-3 border border-stone-200 dark:border-stone-800 shadow-xs">
            <CardContent className="p-0 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24 rounded bg-stone-200/80 dark:bg-stone-800" />
                <Skeleton className="size-6 rounded-md bg-stone-200/80 dark:bg-stone-800" />
              </div>
              <Skeleton className="h-7 w-12 rounded mt-1 bg-stone-200 dark:bg-stone-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Grid: 4 Cards (3 Charts + 1 Deadlines list) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Status Distribution Skeleton */}
        <Card className="h-[320px] p-4 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <Skeleton className="h-4 w-32 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
          </div>
          <div className="space-y-3.5 my-auto">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24 rounded bg-stone-200/80 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-10 rounded bg-stone-200/60 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        </Card>

        {/* Completeness Distribution Skeleton */}
        <Card className="h-[320px] p-4 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <Skeleton className="h-4 w-40 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
          </div>
          <div className="space-y-3.5 my-auto">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded bg-stone-200/80 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-10 rounded bg-stone-200/60 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        </Card>

        {/* Eligibility Distribution Skeleton */}
        <Card className="h-[320px] p-4 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <Skeleton className="h-4 w-36 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-16 rounded bg-stone-200/60 dark:bg-stone-850" />
          </div>
          <div className="space-y-3.5 my-auto">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded bg-stone-200/80 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-10 rounded bg-stone-200/60 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        </Card>

        {/* Deadlines List Skeleton */}
        <Card className="h-[320px] p-4 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <Skeleton className="h-4 w-32 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-12 rounded bg-stone-200/60 dark:bg-stone-850" />
          </div>
          <div className="space-y-2 my-auto">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-2 rounded border border-stone-100 dark:border-stone-800/80 space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24 rounded bg-stone-200/80 dark:bg-stone-800" />
                  <Skeleton className="h-4 w-12 rounded bg-stone-200/60 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-2.5 w-36 rounded bg-stone-100 dark:bg-stone-850" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Prioritized Table Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-card">
          <Skeleton className="h-8 w-64 rounded-md bg-stone-200/80 dark:bg-stone-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32 rounded-md bg-stone-200/80 dark:bg-stone-800" />
            <Skeleton className="h-8 w-32 rounded-md bg-stone-200/80 dark:bg-stone-800" />
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-card overflow-hidden">
          <div className="h-10 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/50 flex items-center px-4 gap-4">
            <Skeleton className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-28 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-36 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-800" />
          </div>

          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 flex items-center px-4 gap-4">
                <Skeleton className="h-4 w-16 rounded font-mono bg-stone-200/80 dark:bg-stone-800" />
                <div className="w-36 space-y-1">
                  <Skeleton className="h-3.5 w-28 rounded bg-stone-200 dark:bg-stone-800" />
                  <Skeleton className="h-2.5 w-20 rounded bg-stone-100 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full bg-stone-200/70 dark:bg-stone-800" />
                <div className="w-24 space-y-1">
                  <Skeleton className="h-2 w-16 rounded bg-stone-200/80 dark:bg-stone-800" />
                  <Skeleton className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-850" />
                </div>
                <Skeleton className="h-4 w-20 rounded bg-stone-200/80 dark:bg-stone-800" />
                <Skeleton className="h-3.5 w-36 rounded bg-stone-200/80 dark:bg-stone-800" />
                <Skeleton className="h-4 w-12 rounded bg-stone-200/80 dark:bg-stone-800" />
                <Skeleton className="h-4 w-16 rounded bg-stone-200/80 dark:bg-stone-800" />
              </div>
            ))}
          </div>

          <div className="h-11 border-t border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/30 flex items-center justify-between px-4">
            <Skeleton className="h-3 w-40 rounded bg-stone-200/80 dark:bg-stone-800" />
            <Skeleton className="h-7 w-32 rounded bg-stone-200/80 dark:bg-stone-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
