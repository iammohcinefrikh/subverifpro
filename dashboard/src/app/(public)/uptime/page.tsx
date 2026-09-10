import Link from "next/link"
import type { Metadata } from "next"
import { getUptimeData } from "@/lib/queries/uptime"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  FileValidationIcon,
  ArrowRight01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"

export const metadata: Metadata = {
  title: "Statut & Santé du Système",
  description: "Disponibilité opérationnelle et télémétrie des workflows de vérification",
}

export const dynamic = "force-dynamic"

export default async function UptimePage() {
  const data = await getUptimeData()
  const isHealthy = data.overallUptimePct >= 99.0

  return (
    <div className="min-h-screen bg-stone-50/40 dark:bg-stone-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center">
              <HugeiconsIcon icon={FileValidationIcon} size={18} strokeWidth={2} />
            </div>
            <div>
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                SubVerif Pro
              </span>
              <span className="text-[11px] text-muted-foreground ml-2 hidden sm:inline">
                Portail de télémétrie & disponibilité
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-stone-300 dark:border-stone-700">
              <Link href="/dashboard">
                <span>Espace Instructeur</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Global Operational Status Banner */}
        <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`size-11 rounded-xl flex items-center justify-center ${
              isHealthy
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
            }`}>
              <HugeiconsIcon
                icon={isHealthy ? CheckmarkCircle02Icon : AlertCircleIcon}
                size={24}
                strokeWidth={2}
              />
            </div>

            <div>
              <h1 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {isHealthy ? "Tous les systèmes sont opérationnels" : "Performances partiellement dégradées"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Surveillance continue basée sur les logs de production des 30 derniers jours.
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-stone-100/70 dark:bg-stone-900 px-3.5 py-2 rounded-lg border border-stone-200/60 dark:border-stone-800">
            <span className="text-xs text-muted-foreground">Disponibilité :</span>
            <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
              {data.overallUptimePct}%
            </span>
          </div>
        </div>

        {/* Services Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.services.map((svc) => {
            const isOp = svc.status === "OPERATIONAL"
            return (
              <Card key={svc.service} className="p-4 border border-stone-200 dark:border-stone-800 shadow-xs">
                <CardContent className="p-0 flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate" title={svc.service}>
                      {svc.service}
                    </span>
                    <span className={`size-2.5 rounded-full ${
                      isOp ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-amber-500 ring-2 ring-amber-500/20"
                    }`} />
                  </div>

                  <div className="flex items-baseline justify-between pt-1 font-mono text-xs">
                    <span className="text-muted-foreground">{svc.statusLabel}</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {svc.uptimePct}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pipeline Execution Latency / Gates */}
        <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} size={16} className="text-stone-700 dark:text-stone-300" />
              <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
                Temps moyen d&apos;exécution par étape du pipeline (Service Metrics)
              </CardTitle>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Total moyen : <strong className="text-stone-900 dark:text-stone-100">{data.avgPipelineDurationMs} ms</strong>
            </span>
          </CardHeader>

          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {data.gateMetrics.map((gate) => (
                <div
                  key={gate.gate}
                  className="p-3 rounded-lg border border-stone-200/60 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-center space-y-1"
                >
                  <div className="text-[11px] font-bold font-mono text-primary">
                    {gate.gate}
                  </div>
                  <span className="text-[11px] font-medium text-stone-800 dark:text-stone-200 block truncate" title={gate.name}>
                    {gate.name}
                  </span>
                  <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                    {gate.avgDurationMs} ms
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Error Logs */}
        <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-rose-600" />
              <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
                Derniers incidents & erreurs système (Workflow Logs)
              </CardTitle>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {data.recentErrors.length} incident{data.recentErrors.length > 1 ? "s" : ""}
            </span>
          </CardHeader>

          <CardContent className="p-4">
            {data.recentErrors.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Aucune erreur récente enregistrée dans le journal des flux.
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-2.5 rounded-md border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 text-xs flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <Badge variant="outline" className="text-[10px] font-mono h-4.5 px-1.5 border-rose-300 dark:border-rose-800 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shrink-0">
                        {err.service}
                      </Badge>
                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                        [{err.node}]
                      </span>
                      <span className="text-stone-800 dark:text-stone-200 break-all">
                        {err.message}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-muted-foreground shrink-0 self-end sm:self-auto">
                      {err.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
