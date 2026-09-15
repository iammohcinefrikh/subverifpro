import type { Metadata } from "next"
import { getStatsData } from "@/lib/queries/stats"
import { formatDuration } from "@/lib/format"
import { TONE_CLASSES, type StatusTone } from "@/lib/status-tone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"

export const metadata: Metadata = {
  title: "Statistiques",
  description:
    "Disponibilité des services sur 24 heures et temps d'exécution du pipeline de vérification",
}

export const dynamic = "force-dynamic"

/** Tone used for a service availability state. */
const STATUS_TONES: Record<string, StatusTone> = {
  OPERATIONAL: "emerald",
  DEGRADED: "amber",
  OUTAGE: "rose",
}

/** Time axis marks spread across the 24 hour window. */
const AXIS_MARKS = ["-24 h", "-18 h", "-12 h", "-6 h", "maintenant"]

export default async function StatistiquesPage() {
  const data = await getStatsData()

  const heading = (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
        Statistiques et disponibilité
      </h1>
      <p className="text-xs text-muted-foreground mt-0.5">
        Disponibilité des services sur les 24 dernières heures et temps
        d&apos;exécution du pipeline de vérification.
      </p>
    </div>
  )

  if (data.services.length === 0) {
    return (
      <div className="space-y-6">
        {heading}
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-card p-8 text-center text-xs text-muted-foreground shadow-xs">
          Données de télémétrie indisponibles pour le moment.
        </div>
      </div>
    )
  }

  const isHealthy = data.overallUptimePct >= 99

  return (
    <div className="space-y-6">
      {heading}

      {/* Global 24h operational status */}
      <div className="p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-card shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
              isHealthy
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
            }`}
          >
            <HugeiconsIcon
              icon={isHealthy ? CheckmarkCircle02Icon : AlertCircleIcon}
              size={20}
              strokeWidth={2}
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {isHealthy
                ? "Tous les services sont opérationnels"
                : "Disponibilité partiellement dégradée"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Surveillance continue des {data.services.length} services du
              pipeline sur les 24 dernières heures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-baseline gap-2 px-3 py-1.5 rounded-lg border border-stone-200/70 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40">
            <span className="text-[11px] text-muted-foreground">
              Disponibilité 24 h
            </span>
            <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
              {data.overallUptimePct} %
            </span>
          </div>

          <div className="flex items-baseline gap-2 px-3 py-1.5 rounded-lg border border-stone-200/70 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40">
            <span className="text-[11px] text-muted-foreground">
              Indisponibilités
            </span>
            <span
              className={`font-mono font-bold text-base ${
                data.downtimeIncidents24h > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-stone-900 dark:text-stone-100"
              }`}
            >
              {data.downtimeIncidents24h}
            </span>
          </div>
        </div>
      </div>

      {/* 24h availability graph, one row per service */}
      <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800/80 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Activity01Icon}
              size={16}
              strokeWidth={2}
              className="text-stone-700 dark:text-stone-300"
            />
            <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
              Disponibilité par service sur 24 heures
            </CardTitle>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Service disponible
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              Indisponibilité (DOWNTIME)
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {data.services.map((service) => {
              const tone = TONE_CLASSES[STATUS_TONES[service.status]]

              return (
                <div
                  key={service.code}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="md:w-64 shrink-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {service.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium h-4.5 px-1.5 shrink-0 ${tone.badge}`}
                      >
                        {service.statusLabel}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-end gap-0.5">
                      {service.slots.map((slot, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger
                            aria-label={`${slot.rangeLabel} : ${
                              slot.hasDowntime
                                ? `${slot.incidents} indisponibilité${slot.incidents > 1 ? "s" : ""}`
                                : "aucun incident"
                            }`}
                            className={`h-9 w-1.5 shrink-0 rounded-full transition-colors ${
                              slot.hasDowntime
                                ? "bg-rose-500 hover:bg-rose-400"
                                : "bg-emerald-500 hover:bg-emerald-400"
                            }`}
                          />
                          <TooltipContent side="top">
                            <span className="font-mono">{slot.rangeLabel}</span>
                            <span>·</span>
                            <span>
                              {slot.hasDowntime
                                ? `${slot.incidents} indisponibilité${slot.incidents > 1 ? "s" : ""}`
                                : "Aucun incident"}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>

                    <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground/80">
                      {AXIS_MARKS.map((mark) => (
                        <span key={mark}>{mark}</span>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-36 shrink-0 md:text-right">
                    <div className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {service.uptimePct} %
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {service.incidents24h} incident
                      {service.incidents24h > 1 ? "s" : ""} ·{" "}
                      {service.downtimeSlots} h dégradée
                      {service.downtimeSlots > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline execution times per gate */}
      <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800/80 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Clock01Icon}
              size={16}
              strokeWidth={2}
              className="text-stone-700 dark:text-stone-300"
            />
            <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
              Temps d&apos;exécution moyen par étape du pipeline
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Total moyen :{" "}
            <strong className="text-stone-900 dark:text-stone-100">
              {formatDuration(data.avgPipelineDurationMs)}
            </strong>
            {" · "}
            {data.totalPipelinesExecuted} exécution
            {data.totalPipelinesExecuted > 1 ? "s" : ""} mesurée
            {data.totalPipelinesExecuted > 1 ? "s" : ""}
          </span>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.gateMetrics.map((gate) => (
              <div
                key={gate.gate}
                className="p-3 rounded-lg border border-stone-200/60 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-center space-y-1"
              >
                <div className="text-[11px] font-bold font-mono text-primary">
                  {gate.gate}
                </div>
                <span
                  className="text-[11px] font-medium text-stone-800 dark:text-stone-200 block truncate"
                  title={gate.name}
                >
                  {gate.name}
                </span>
                <span
                  className={`font-mono text-xs font-semibold block ${
                    gate.avgDurationMs === null
                      ? "text-muted-foreground"
                      : "text-stone-900 dark:text-stone-100"
                  }`}
                >
                  {formatDuration(gate.avgDurationMs)}
                </span>
                <span className="text-[9px] text-muted-foreground block">
                  {gate.samples > 0
                    ? `${gate.samples} mesure${gate.samples > 1 ? "s" : ""}`
                    : "aucune mesure"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow log incidents */}
      <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={16}
              strokeWidth={2}
              className="text-rose-600 dark:text-rose-400"
            />
            <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
              Derniers incidents du journal des flux
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground shrink-0">
            {data.incidents.length} incident
            {data.incidents.length > 1 ? "s" : ""}
          </span>
        </CardHeader>

        <CardContent className="p-4">
          {data.incidents.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Aucune indisponibilité ni erreur de nœud enregistrée sur les 24
              dernières heures.
            </div>
          ) : (
            <div className="space-y-2">
              {data.incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-2.5 rounded-md border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium h-4.5 px-1.5 shrink-0 ${
                        incident.errorType === "DOWNTIME"
                          ? TONE_CLASSES.rose.badge
                          : TONE_CLASSES.amber.badge
                      }`}
                    >
                      {incident.service}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium h-4.5 px-1.5 shrink-0 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                    >
                      {incident.typeLabel}
                    </Badge>
                    {incident.node && (
                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                        [{incident.node}]
                      </span>
                    )}
                    <span className="text-xs text-stone-800 dark:text-stone-200 break-all">
                      {incident.message}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-muted-foreground shrink-0 self-end sm:self-auto">
                    {incident.createdAt}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}