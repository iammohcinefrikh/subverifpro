import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const cardClass = "border border-stone-200 dark:border-stone-800 shadow-xs"
/** Default card header: no rule, just the icon + title row. */
const headerClass = "p-4 pb-2! flex flex-row items-center justify-between"
/** Card header with a rule under it, as used by the éligibilité card. */
const ruledHeaderClass = `${headerClass} border-b border-stone-100 dark:border-stone-800/80`
const contentClass = "pb-4 pt-3 space-y-3 text-xs"

/** Mirrors the muted section box in `DemandeurInfo`. */
const sectionBoxClass =
  "rounded-xl border border-transparent bg-muted/50 px-4 py-3.5 flex flex-col gap-4"
const sectionBodyClass = "flex flex-col gap-4"

const titleSkeleton = "h-4 rounded bg-stone-200 dark:bg-stone-800"
const labelSkeleton = "h-2.5 rounded bg-stone-200/60 dark:bg-stone-800"
const valueSkeleton = "h-3.5 rounded bg-stone-200 dark:bg-stone-800"

function Tile({ labelWidth = "w-16", valueWidth = "w-24" }: { labelWidth?: string; valueWidth?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className={`${labelWidth} ${labelSkeleton}`} />
      <Skeleton className={`${valueWidth} ${valueSkeleton}`} />
    </div>
  )
}

/** Mirrors `Section` in `DemandeurInfo`: title + rule, then the tiles. */
function Section({
  titleWidth = "w-32",
  children,
}: {
  titleWidth?: string
  children: ReactNode
}) {
  return (
    <div className={sectionBoxClass}>
      <div className="flex flex-col gap-2">
        <Skeleton className={`h-2.5 ${titleWidth} ${labelSkeleton}`} />
        <Separator />
      </div>
      <div className={sectionBodyClass}>{children}</div>
    </div>
  )
}

export default function DossierDetailLoading() {
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header: back button, reference/status/priority badges, action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-lg bg-stone-200/80 dark:bg-stone-800" />
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-6 w-32 rounded font-mono bg-stone-200 dark:bg-stone-800" />
            <Skeleton className="h-7 w-24 rounded-full bg-stone-200/70 dark:bg-stone-800" />
            <Skeleton className="h-7 w-32 rounded-full bg-stone-200/70 dark:bg-stone-800" />
          </div>
        </div>
        {/* "Prendre en charge" (1 button) or "Accepter" + "Rejeter" (2 buttons) */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-md bg-stone-200/80 dark:bg-stone-800" />
          <Skeleton className="h-9 w-24 rounded-md bg-stone-200/80 dark:bg-stone-800" />
        </div>
      </div>

      {/* 2. Synthèse IA & Recommandations */}
      <Card className={`${cardClass} relative`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-purple-50 via-purple-50/40 to-transparent dark:from-purple-950/60 dark:via-purple-950/25"
        />
        <CardHeader className="relative p-4 pb-2! flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-md bg-stone-200/80 dark:bg-stone-800" />
            <Skeleton className={`w-56 ${titleSkeleton}`} />
          </div>
          <Skeleton className="h-5 w-28 rounded-full bg-stone-200/70 dark:bg-stone-800" />
        </CardHeader>
        <CardContent className="relative pb-4 space-y-4 text-xs">
          {/* Résumé synthétique */}
          <div className="flex flex-col gap-1">
            <Skeleton className="mb-1 h-2.5 w-32 rounded bg-stone-200/60 dark:bg-stone-800" />
            <Skeleton className="h-3 w-full rounded bg-stone-200/60 dark:bg-stone-800" />
            <Skeleton className="h-3 w-full rounded bg-stone-200/60 dark:bg-stone-800" />
            <Skeleton className="h-3 w-2/3 rounded bg-stone-200/60 dark:bg-stone-800" />
          </div>

          <Skeleton className="h-px w-full bg-stone-200/80 dark:bg-stone-800" />

          {/* Qualité du projet & Cohérence budgétaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-x-12">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-2.5 w-24 rounded bg-stone-200/60 dark:bg-stone-800" />
                <Skeleton className="h-3.5 w-12 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full bg-stone-200/80 dark:bg-stone-800" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-2.5 w-32 rounded bg-stone-200/60 dark:bg-stone-800" />
                <Skeleton className="h-3 w-16 rounded bg-stone-200 dark:bg-stone-800" />
              </div>
              <Skeleton className="h-3 w-full rounded bg-stone-200/60 dark:bg-stone-800" />
              <Skeleton className="h-3 w-3/4 rounded bg-stone-200/60 dark:bg-stone-800" />
            </div>
          </div>

          <Skeleton className="h-px w-full bg-stone-200/80 dark:bg-stone-800" />

          {/* Points forts, Risques, À vérifier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-2.5 w-24 rounded bg-stone-200/60 dark:bg-stone-800" />
                <div className="space-y-0.5">
                  <Skeleton className="h-3 w-full rounded bg-stone-200/60 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-5/6 rounded bg-stone-200/60 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-4/6 rounded bg-stone-200/60 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Informations du demandeur & projet */}
      <Card className={cardClass}>
        <CardHeader className="p-4 pb-2!">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
            <Skeleton className={`w-64 ${titleSkeleton}`} />
          </div>
        </CardHeader>
        <CardContent className="pb-4 space-y-2 text-xs">
          {/* Identité & Coordonnées — 2 rows of 3 tiles */}
          <Section titleWidth="w-32">
            {Array.from({ length: 2 }).map((_, row) => (
              <div key={row} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Tile valueWidth="w-32" />
                </div>
                <Tile />
                <Tile labelWidth="w-24" />
              </div>
            ))}
          </Section>

          {/* Programme & Structure — full-width programme, then 4 tiles */}
          <Section titleWidth="w-36">
            <Tile labelWidth="w-20" valueWidth="w-40" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Tile labelWidth="w-24" valueWidth="w-40" />
              </div>
              <Tile labelWidth="w-24" />
              <Tile />
              <div className="col-span-2 sm:col-span-1">
                <Tile />
              </div>
            </div>
          </Section>

          {/* Projet & Budget — objet/description, then dates + amounts */}
          <Section titleWidth="w-28">
            <Tile labelWidth="w-24" valueWidth="w-3/4" />
            <Tile labelWidth="w-28" valueWidth="w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Tile />
              <Tile />
              <Tile labelWidth="w-16" valueWidth="w-28" />
              <Tile labelWidth="w-24" valueWidth="w-28" />
            </div>
          </Section>

          {/* Dépenses du projet — label/value rows */}
          <Section titleWidth="w-28">
            <div className="space-y-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <Skeleton className="h-3 w-40 rounded bg-stone-200/60 dark:bg-stone-800" />
                  <Skeleton className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              ))}
            </div>
          </Section>
        </CardContent>
      </Card>

      {/* 4. Complétude & Éligibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Complétude du dossier */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className={`w-44 ${titleSkeleton}`} />
            </div>
            <Skeleton className="h-3.5 w-10 rounded bg-stone-200 dark:bg-stone-800" />
          </CardHeader>
          <CardContent className={contentClass}>
            {/* Fournis / Manquants / Expirés */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 p-2 rounded-md bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800"
                >
                  <Skeleton className="h-2.5 w-14 rounded bg-stone-200/60 dark:bg-stone-800" />
                  <Skeleton className="h-4 w-6 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              ))}
            </div>

            {/* Inventaire des pièces */}
            <div className="space-y-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-md border border-stone-200/60 dark:border-stone-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="size-3.5 shrink-0 rounded-full bg-stone-200/80 dark:bg-stone-800" />
                    <Skeleton className="h-3.5 w-40 rounded bg-stone-200 dark:bg-stone-800" />
                  </div>
                  <Skeleton className="h-4.5 w-16 shrink-0 rounded-full bg-stone-200/70 dark:bg-stone-800" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Éligibilité réglementaire */}
        <Card className={cardClass}>
          <CardHeader className={ruledHeaderClass}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded bg-stone-200/80 dark:bg-stone-800" />
              <Skeleton className={`w-44 ${titleSkeleton}`} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20 rounded bg-stone-200/60 dark:bg-stone-800" />
              <Skeleton className="h-5 w-24 rounded-full bg-stone-200/70 dark:bg-stone-800" />
            </div>
          </CardHeader>
          <CardContent className={contentClass}>
            {/* Critères non validés */}
            <div className="space-y-1.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="mt-0.5 size-3.5 shrink-0 rounded-full bg-stone-200/80 dark:bg-stone-800" />
                  <Skeleton className="h-3.5 w-48 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              ))}
            </div>

            {/* Évaluation détaillée des critères */}
            <div className="space-y-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-2.5 rounded-md border border-stone-200/60 dark:border-stone-800 gap-2"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <Skeleton className="mt-0.5 size-3.5 shrink-0 rounded-full bg-stone-200/80 dark:bg-stone-800" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-40 rounded bg-stone-200 dark:bg-stone-800" />
                      <Skeleton className="h-3 w-52 rounded bg-stone-200/60 dark:bg-stone-800" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <Skeleton className="h-4.5 w-20 rounded-full bg-stone-200/70 dark:bg-stone-800" />
                    <Skeleton className="h-2.5 w-10 rounded bg-stone-200/60 dark:bg-stone-800" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}