import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { computePriority, type PriorityInfo } from "@/lib/utils/priority"

export interface DashboardKPIs {
  /** Applications with status CONFORME, INCOMPLETE or PENDING. */
  totalApplications: number
  /** Applications with status CONFORME. */
  completedDossiers: number
  /** Applications with status INCOMPLETE. */
  incompleteDossiers: number
  /** Applications with status PENDING. */
  pendingDossiers: number
  /** Applications with an overall eligibility status of PASS or WARNING and that
   *  are not in PENDING, ACCEPTED or REJECTED. */
  eligibleDossiers: number
  /** Applications whose project start date falls within the next 10 days. */
  urgentDossiers: number
}

export interface StatusDistributionItem {
  status: string
  label: string
  count: number
  fill: string
}

export interface CompletenessDistributionItem {
  range: string
  count: number
  percentage: number
}

export interface EligibilityDistributionItem {
  result: string
  label: string
  count: number
  fill: string
}

export interface UpcomingDeadlineItem {
  id: string
  applicationId: string
  applicantName: string
  programName: string
  deadline: Date
  daysLeft: number
  missingDocsCount: number
  isUrgent: boolean
}

export interface DossierRowItem {
  id: string
  applicationId: string
  reference: string
  applicantName: string
  programName: string
  status: string
  statusLabel: string
  completenessRate: number
  hasComplianceCheck: boolean
  hasPendingComplement: boolean
  eligibilityResult: string
  eligibilityLabel: string
  eligibilityScore: number | null
  missingDocsCount: number
  expiredDocsCount: number
  problemText: string
  deadline: Date | null
  deadlineFormatted: string
  projectStartDate: Date | null
  priority: PriorityInfo
  isUrgent: boolean
  totalAmount: number
  requestedAmount: number
  submittedAt: Date | null
}

/** Number of days ahead that marks a project as urgent. */
export const URGENT_WINDOW_DAYS = 10

/** Minimum eligibility score (`total_points`) required to keep a dossier that
 *  still has missing/expired documents in the priority list. */
export const MIN_ELIGIBILITY_FOR_DOCS = 50

export const dossierInclude = {
  program: true,
  complianceCheck: true,
  applicationEligibilityResult: true,
  complementRequests: {
    orderBy: { deadline: "asc" as const },
  },
}

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof dossierInclude
}>

export type NormalizedEligibility = "PASS" | "WARNING" | "FAIL" | "NON_EVALUE"

/**
 * Normalizes the `overall_status` values coming from
 * `application_eligibility_results` (PASS / WARNING / FAILED) into a stable
 * three-state vocabulary used across the dashboard.
 */
export function normalizeEligibilityStatus(
  raw?: string | null
): NormalizedEligibility {
  const value = (raw || "").toUpperCase()
  if (value === "PASS" || value === "PASSED" || value === "ELIGIBLE") return "PASS"
  if (value === "WARNING" || value === "ATTENTION" || value === "A_REVOIR") return "WARNING"
  if (value === "FAIL" || value === "FAILED" || value === "NON_ELIGIBLE" || value === "REJECTED") {
    return "FAIL"
  }
  return "NON_EVALUE"
}

export function getUrgentWindow(now: Date = new Date()) {
  return {
    from: now,
    to: new Date(now.getTime() + URGENT_WINDOW_DAYS * 24 * 60 * 60 * 1000),
  }
}

export function isProjectUrgent(
  projectStartDate: Date | null,
  now: Date = new Date()
): boolean {
  if (!projectStartDate) return false
  const { from, to } = getUrgentWindow(now)
  const start = projectStartDate.getTime()
  return start >= from.getTime() && start <= to.getTime()
}

export function mapApplicationToDossierRow(
  app: ApplicationWithRelations
): DossierRowItem {
  const comp = app.complianceCheck
  const elig = app.applicationEligibilityResult
  const complementRequests = app.complementRequests ?? []
  const compl = complementRequests[0]

  const completenessRate = comp ? Number(comp.completenessRate || 0) : 0
  const missingCount = comp?.missingCount || 0
  const expiredCount = comp?.expiredCount || 0

  const eligibilityResult = normalizeEligibilityStatus(elig?.overallStatus)
  const eligibilityLabel = formatEligibilityLabel(eligibilityResult)

  // Compute human-friendly problem string
  let problemText = "—"
  if (missingCount > 0 && expiredCount > 0) {
    problemText = `${missingCount} doc. manquant${missingCount > 1 ? "s" : ""}, ${expiredCount} expiré${expiredCount > 1 ? "s" : ""}`
  } else if (missingCount > 0) {
    problemText = `${missingCount} pièce${missingCount > 1 ? "s" : ""} manquante${missingCount > 1 ? "s" : ""}`
  } else if (expiredCount > 0) {
    problemText = `${expiredCount} pièce${expiredCount > 1 ? "s" : ""} expirée${expiredCount > 1 ? "s" : ""}`
  } else if (eligibilityResult === "FAIL") {
    problemText = "Non éligible"
  } else if (eligibilityResult === "WARNING") {
    problemText = "Éligibilité à vérifier"
  } else if (app.status === "PENDING" || app.status === "SUBMITTED") {
    problemText = "Vérification requise"
  }

  const deadline = compl?.deadline ? new Date(compl.deadline) : null
  const deadlineFormatted = deadline
    ? deadline.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    : "—"

  const projectStartDate = app.projectStartDate ? new Date(app.projectStartDate) : null
  const isUrgent = isProjectUrgent(projectStartDate)

  const priority = computePriority({
    projectStartDate,
    deadline,
    eligibilityScore: elig?.totalPoints ?? null,
  })

  const refShort = `APP-${app.applicationId.slice(0, 6).toUpperCase()}`

  const hasPendingComplement = complementRequests.some((c) =>
    ["EN_ATTENTE", "en_attente", "PENDING", "pending"].includes(c.status || "")
  )

  return {
    id: app.id,
    applicationId: app.applicationId,
    reference: refShort,
    applicantName: `${app.firstName} ${app.lastName}`,
    programName: app.program?.name || app.programId,
    status: app.status || "SUBMITTED",
    statusLabel: formatStatusLabel(app.status || "SUBMITTED"),
    completenessRate,
    hasComplianceCheck: Boolean(comp),
    hasPendingComplement,
    eligibilityResult,
    eligibilityLabel,
    eligibilityScore: elig?.totalPoints ?? null,
    missingDocsCount: missingCount,
    expiredDocsCount: expiredCount,
    problemText,
    deadline,
    deadlineFormatted,
    projectStartDate,
    priority,
    isUrgent,
    totalAmount: Number(app.totalAmount || 0),
    requestedAmount: Number(app.requestedAmount || 0),
    submittedAt: app.submittedAt ? new Date(app.submittedAt) : null,
  }
}

export async function getDashboardData() {
  try {
    const now = new Date()
    const urgentWindow = getUrgentWindow(now)

    // Execute queries in parallel
    const [
      receivedCount,
      completedCount,
      incompleteCount,
      pendingCount,
      eligibleCount,
      urgentCount,
      allApplications,
      complianceChecks,
      upcomingComplements,
    ] = await Promise.all([
      // 1. Dossiers reçus (CONFORME, INCOMPLETE, PENDING)
      prisma.application
        .count({
          where: { status: { in: ["CONFORME", "INCOMPLETE", "PENDING"] } },
        })
        .catch(() => 0),

      // 2. Dossiers complets (CONFORME)
      prisma.application
        .count({ where: { status: "CONFORME" } })
        .catch(() => 0),

      // 3. Dossiers incomplets (INCOMPLETE)
      prisma.application
        .count({ where: { status: "INCOMPLETE" } })
        .catch(() => 0),

      // 4. Dossiers en traitement (PENDING)
      prisma.application
        .count({ where: { status: "PENDING" } })
        .catch(() => 0),

      // 5. Dossiers éligibles (overall_status PASS/WARNING, not PENDING/ACCEPTED/REJECTED)
      prisma.application
        .count({
          where: {
            status: { notIn: ["PENDING", "ACCEPTED", "REJECTED"] },
            applicationEligibilityResult: {
              is: { overallStatus: { in: ["PASS", "WARNING"] } },
            },
          },
        })
        .catch(() => 0),

      // 6. Dossiers urgents (project start date within the next 10 days)
      prisma.application
        .count({
          where: {
            projectStartDate: {
              gte: urgentWindow.from,
              lte: urgentWindow.to,
            },
          },
        })
        .catch(() => 0),

      // Applications list for table & status/eligibility distribution
      prisma.application
        .findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          include: dossierInclude,
        })
        .catch(() => []),

      // Compliance checks for completeness distribution
      prisma.complianceCheck
        .findMany({
          select: { completenessRate: true },
          take: 200,
        })
        .catch(() => []),

      // Upcoming deadlines (next 10)
      prisma.complementRequest
        .findMany({
          where: {
            deadline: { gte: now },
            status: { in: ["EN_ATTENTE", "en_attente", "PENDING", "pending"] },
          },
          orderBy: { deadline: "asc" },
          take: 10,
          include: {
            application: {
              include: { program: true },
            },
          },
        })
        .catch(() => []),
    ])

    // --- Status Distribution ---
    const statusMap = new Map<string, number>()
    allApplications.forEach((app) => {
      const s = app.status || "SUBMITTED"
      statusMap.set(s, (statusMap.get(s) || 0) + 1)
    })

    const statusColors: Record<string, string> = {
      SUBMITTED: "var(--color-stone-400, #a8a29e)",
      INCOMPLETE: "var(--color-amber-500, #f59e0b)",
      PENDING: "var(--color-blue-500, #3b82f6)",
      ACCEPTED: "var(--color-emerald-600, #059669)",
      REJECTED: "var(--color-rose-500, #f43f5e)",
      CONFORME: "var(--color-emerald-500, #10b981)",
    }

    const statusDistribution: StatusDistributionItem[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        label: formatStatusLabel(status),
        count,
        fill: statusColors[status.toUpperCase()] || "var(--color-stone-500, #78716c)",
      })
    )

    // --- Completeness Distribution ---
    let range0_25 = 0
    let range25_50 = 0
    let range50_75 = 0
    let range75_100 = 0

    complianceChecks.forEach((c) => {
      const rate = Number(c.completenessRate || 0)
      if (rate < 25) range0_25++
      else if (rate < 50) range25_50++
      else if (rate < 75) range50_75++
      else range75_100++
    })

    const totalChecks = complianceChecks.length || 1
    const completenessDistribution: CompletenessDistributionItem[] = [
      { range: "0 - 25%", count: range0_25, percentage: Math.round((range0_25 / totalChecks) * 100) },
      { range: "25 - 50%", count: range25_50, percentage: Math.round((range25_50 / totalChecks) * 100) },
      { range: "50 - 75%", count: range50_75, percentage: Math.round((range50_75 / totalChecks) * 100) },
      { range: "75 - 100%", count: range75_100, percentage: Math.round((range75_100 / totalChecks) * 100) },
    ]

    // --- Eligibility Distribution (overall_status of application_eligibility_results) ---
    const eligMap = new Map<NormalizedEligibility, number>()
    allApplications.forEach((app) => {
      // Only count applications that aren't PENDING, REJECTED or ACCEPTED.
      if (app.status && ["PENDING", "REJECTED", "ACCEPTED"].includes(app.status)) return
      if (!app.applicationEligibilityResult) return
      const result = normalizeEligibilityStatus(app.applicationEligibilityResult.overallStatus)
      if (result === "NON_EVALUE") return
      eligMap.set(result, (eligMap.get(result) || 0) + 1)
    })

    const eligColors: Record<NormalizedEligibility, string> = {
      PASS: "var(--color-emerald-500, #10b981)",
      WARNING: "var(--color-amber-500, #f59e0b)",
      FAIL: "var(--color-rose-500, #f43f5e)",
      NON_EVALUE: "var(--color-stone-400, #a8a29e)",
    }

    const eligibilityDistribution: EligibilityDistributionItem[] = Array.from(eligMap.entries()).map(
      ([result, count]) => ({
        result,
        label: formatEligibilityLabel(result),
        count,
        fill: eligColors[result],
      })
    )

    // --- Upcoming Deadlines ---
    const upcomingDeadlineItems: UpcomingDeadlineItem[] = upcomingComplements.map((c) => {
      const app = c.application
      const d = new Date(c.deadline)
      const diffMs = d.getTime() - now.getTime()
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      const isUrgent = diffMs <= 48 * 60 * 60 * 1000

      return {
        id: c.id,
        applicationId: c.applicationId,
        applicantName: app ? `${app.firstName} ${app.lastName}` : "Demandeur inconnu",
        programName: app?.program?.name || app?.programId || "Programme standard",
        deadline: d,
        daysLeft,
        missingDocsCount: c.missingDocs?.length || 0,
        isUrgent,
      }
    })

    // --- "À instruire en priorité" Rows ---
    // Only evaluated dossiers (PASS/WARNING), excluding already-processed ones
    // (ACCEPTED/REJECTED). Dossiers with missing/expired documents are kept only
    // when their eligibility score is good enough to justify chasing the docs.
    const dossiersATraiter: DossierRowItem[] = allApplications
      .map(mapApplicationToDossierRow)
      .filter((row) => {
        if (row.eligibilityResult !== "PASS" && row.eligibilityResult !== "WARNING") return false
        const status = row.status.toUpperCase()
        if (status === "ACCEPTED" || status === "REJECTED") return false
        const hasDocumentIssues = row.missingDocsCount + row.expiredDocsCount > 0
        if (hasDocumentIssues && (row.eligibilityScore ?? 0) < MIN_ELIGIBILITY_FOR_DOCS) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (b.priority.score !== a.priority.score) return b.priority.score - a.priority.score
        if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime()
        return 0
      })

    return {
      kpis: {
        totalApplications: receivedCount,
        completedDossiers: completedCount,
        incompleteDossiers: incompleteCount,
        pendingDossiers: pendingCount,
        eligibleDossiers: eligibleCount,
        urgentDossiers: urgentCount,
      },
      statusDistribution,
      completenessDistribution,
      eligibilityDistribution,
      upcomingDeadlines: upcomingDeadlineItems,
      dossiersATraiter,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    // Fallback data if tables are empty
    return {
      kpis: {
        totalApplications: 0,
        completedDossiers: 0,
        incompleteDossiers: 0,
        pendingDossiers: 0,
        eligibleDossiers: 0,
        urgentDossiers: 0,
      },
      statusDistribution: [],
      completenessDistribution: [],
      eligibilityDistribution: [],
      upcomingDeadlines: [],
      dossiersATraiter: [],
    }
  }
}

export function formatStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "SUBMITTED":
      return "Reçu"
    case "INCOMPLETE":
      return "Incomplet"
    case "PENDING":
      return "En traitement"
    case "ACCEPTED":
      return "Accepté"
    case "REJECTED":
      return "Rejeté"
    case "CONFORME":
      return "Complet"
    default:
      return status
  }
}

export function formatEligibilityLabel(result: string): string {
  switch (result.toUpperCase()) {
    case "PASS":
      return "Éligible"
    case "WARNING":
      return "À vérifier"
    case "FAIL":
      return "Non éligible"
    case "NON_EVALUE":
      return "Non évalué"
    default:
      return result
  }
}
