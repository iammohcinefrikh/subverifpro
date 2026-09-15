import { prisma } from "@/lib/prisma"
import type { LogErrorType, LogService } from "@prisma/client"

/** Number of hourly slots rendered in the 24h availability graph. */
const UPTIME_SLOTS = 24
const HOUR_MS = 60 * 60 * 1000

/**
 * The pipeline services that write to `workflow_logs`, in execution order.
 *
 * The database stores them through the short `log_service` enum (S1..S4), so
 * each stage is labelled here with its French display name.
 */
const SERVICES: { code: LogService; name: string; description: string }[] = [
  {
    code: "S1",
    name: "Service d'ingestion",
    description: "Réception et extraction des pièces du dossier",
  },
  {
    code: "S2",
    name: "Moteur de conformité",
    description: "Contrôle de conformité documentaire",
  },
  {
    code: "S3",
    name: "Évaluateur d'éligibilité",
    description: "Évaluation des critères d'éligibilité",
  },
  {
    code: "S4",
    name: "Pipeline d'analyse IA",
    description: "Analyse IA et synthèse de décision",
  },
]

const SERVICE_NAMES = new Map<string, string>(
  SERVICES.map(({ code, name }) => [code, name])
)

const ERROR_TYPE_LABELS: Record<LogErrorType, string> = {
  DOWNTIME: "Indisponibilité",
  NODE_ERROR: "Erreur de nœud",
}

export interface UptimeSlot {
  /** Clock label of the hour the slot starts at, e.g. "14:00". */
  label: string
  /** Full hour range covered by the slot, e.g. "14:00 → 15:00". */
  rangeLabel: string
  /** True when at least one DOWNTIME incident was logged during the slot. */
  hasDowntime: boolean
  incidents: number
}

export interface ServiceUptime {
  code: LogService
  /** French display name, e.g. "Service d'ingestion". */
  name: string
  description: string
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE"
  statusLabel: string
  /** Share of the 24 hourly slots that recorded no DOWNTIME incident. */
  uptimePct: number
  downtimeSlots: number
  /** DOWNTIME incidents logged over the last 24h. */
  incidents24h: number
  slots: UptimeSlot[]
}

export interface IncidentItem {
  id: string
  service: string
  node: string
  message: string
  errorType: LogErrorType
  typeLabel: string
  createdAt: string
}

export interface GateMetric {
  gate: string
  name: string
  /** Average execution time in ms, or null when the gate was never measured. */
  avgDurationMs: number | null
  /** Number of executions the average is computed from. */
  samples: number
}

export interface StatsPageData {
  /** Availability across all services over the 24h window, in percent. */
  overallUptimePct: number
  downtimeIncidents24h: number
  services: ServiceUptime[]
  incidents: IncidentItem[]
  gateMetrics: GateMetric[]
  avgPipelineDurationMs: number | null
  /** Number of `service_metrics` rows the averages are computed from. */
  totalPipelinesExecuted: number
}

function formatHour(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:00`
}

function formatTimestamp(value: Date | null): string {
  if (!value) return "—"

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value)
}

export async function getStatsData(): Promise<StatsPageData> {
  try {
    const now = new Date()
    const since = new Date(now.getTime() - UPTIME_SLOTS * HOUR_MS)
    // Slots are aligned on clock hours so their labels stay readable; the last
    // slot is the current (partial) hour.
    const currentHourStart = new Date(Math.floor(now.getTime() / HOUR_MS) * HOUR_MS)

    const [downtimeLogs, recentLogs, metricsRaw] = await Promise.all([
      // Only DOWNTIME incidents turn a slot red.
      prisma.workflowLog.findMany({
        where: { errorType: "DOWNTIME", createdAt: { gte: since } },
        select: { service: true, createdAt: true },
      }),

      prisma.workflowLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          service: true,
          node: true,
          message: true,
          errorType: true,
          createdAt: true,
        },
      }),

      prisma.serviceMetric.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          g1DurationMs: true,
          g2DurationMs: true,
          g3DurationMs: true,
          g4DurationMs: true,
          g5DurationMs: true,
          totalDurationMs: true,
        },
      }),
    ])

    // Bucket DOWNTIME incidents per service, per hourly slot.
    const bucketsByService = new Map<LogService, number[]>(
      SERVICES.map(({ code }) => [code, new Array<number>(UPTIME_SLOTS).fill(0)])
    )

    for (const log of downtimeLogs) {
      if (!log.createdAt) continue

      const buckets = bucketsByService.get(log.service)
      if (!buckets) continue

      // Hours between the start of the current hour and the incident. Incidents
      // inside the current hour land on the last slot.
      const hoursBefore = Math.floor(
        (currentHourStart.getTime() - log.createdAt.getTime()) / HOUR_MS
      )
      const index = Math.max(
        0,
        Math.min(UPTIME_SLOTS - 1, UPTIME_SLOTS - 1 - hoursBefore)
      )
      buckets[index] += 1
    }

    let totalSlots = 0
    let healthySlots = 0

    const services: ServiceUptime[] = SERVICES.map(({ code, name, description }) => {
      const buckets = bucketsByService.get(code) ?? []

      const slots: UptimeSlot[] = buckets.map((incidents, index) => {
        const start = new Date(
          currentHourStart.getTime() - (UPTIME_SLOTS - 1 - index) * HOUR_MS
        )
        const end = new Date(start.getTime() + HOUR_MS)

        return {
          label: formatHour(start),
          rangeLabel: `${formatHour(start)} → ${formatHour(end)}`,
          hasDowntime: incidents > 0,
          incidents,
        }
      })

      const downtimeSlots = slots.filter((slot) => slot.hasDowntime).length
      const incidents24h = buckets.reduce((total, count) => total + count, 0)

      let status: ServiceUptime["status"] = "OPERATIONAL"
      let statusLabel = "Opérationnel"

      if (downtimeSlots > 2) {
        status = "OUTAGE"
        statusLabel = "Interruption"
      } else if (downtimeSlots > 0) {
        status = "DEGRADED"
        statusLabel = "Perturbé"
      }

      totalSlots += UPTIME_SLOTS
      healthySlots += UPTIME_SLOTS - downtimeSlots

      return {
        code,
        name,
        description,
        status,
        statusLabel,
        uptimePct: Number((((UPTIME_SLOTS - downtimeSlots) / UPTIME_SLOTS) * 100).toFixed(2)),
        downtimeSlots,
        incidents24h,
        slots,
      }
    })

    const incidents: IncidentItem[] = recentLogs.map((log) => ({
      id: log.id,
      service: SERVICE_NAMES.get(log.service) ?? log.service,
      node: log.node,
      message: log.message,
      errorType: log.errorType,
      typeLabel: ERROR_TYPE_LABELS[log.errorType],
      createdAt: formatTimestamp(log.createdAt),
    }))

    // Gate durations: average each gate over its own non-null measurements, so
    // gates that were never reached are reported as unmeasured instead of 0.
    const gateAggregates = [
      { gate: "G1", name: "Réception & validation", total: 0, samples: 0 },
      { gate: "G2", name: "Extraction documentaire", total: 0, samples: 0 },
      { gate: "G3", name: "Contrôle conformité", total: 0, samples: 0 },
      { gate: "G4", name: "Analyse éligibilité", total: 0, samples: 0 },
      { gate: "G5", name: "Synthèse & décision IA", total: 0, samples: 0 },
    ]
    let pipelineTotal = 0
    let pipelineSamples = 0

    for (const metric of metricsRaw) {
      const durations = [
        metric.g1DurationMs,
        metric.g2DurationMs,
        metric.g3DurationMs,
        metric.g4DurationMs,
        metric.g5DurationMs,
      ]

      durations.forEach((duration, index) => {
        if (duration === null) return
        gateAggregates[index].total += duration
        gateAggregates[index].samples += 1
      })

      if (metric.totalDurationMs !== null) {
        pipelineTotal += metric.totalDurationMs
        pipelineSamples += 1
      }
    }

    const gateMetrics: GateMetric[] = gateAggregates.map(
      ({ gate, name, total, samples }) => ({
        gate,
        name,
        avgDurationMs: samples > 0 ? Math.round(total / samples) : null,
        samples,
      })
    )

    return {
      overallUptimePct: totalSlots > 0 ? Number(((healthySlots / totalSlots) * 100).toFixed(2)) : 100,
      downtimeIncidents24h: downtimeLogs.length,
      services,
      incidents,
      gateMetrics,
      avgPipelineDurationMs: pipelineSamples > 0 ? Math.round(pipelineTotal / pipelineSamples) : null,
      totalPipelinesExecuted: metricsRaw.length,
    }
  } catch (error) {
    console.error("Error fetching stats data:", error)

    return {
      overallUptimePct: 0,
      downtimeIncidents24h: 0,
      services: [],
      incidents: [],
      gateMetrics: [],
      avgPipelineDurationMs: null,
      totalPipelinesExecuted: 0,
    }
  }
}