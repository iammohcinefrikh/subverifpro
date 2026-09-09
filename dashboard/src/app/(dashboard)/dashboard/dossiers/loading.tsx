import { Skeleton } from "@/components/ui/skeleton"

export default function DossiersListLoading() {
  return (
    <div className="space-y-24">
      {/* Header row: title/tagline on the left, search + filters on the right */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56 rounded-md bg-stone-200/80 dark:bg-stone-800" />
          <Skeleton className="h-3.5 w-80 rounded bg-stone-200/60 dark:bg-stone-850" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          <Skeleton className="h-8 w-full sm:w-64 rounded-md bg-stone-200/80 dark:bg-stone-800" />
          <Skeleton className="h-8 w-40 rounded-md bg-stone-200/80 dark:bg-stone-800" />
          <Skeleton className="h-8 w-40 rounded-md bg-stone-200/80 dark:bg-stone-800" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-card overflow-hidden shadow-xs">
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
          {Array.from({ length: 8 }).map((_, i) => (
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
  )
}
