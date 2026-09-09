import { prisma } from "@/lib/prisma"
import { computePriority, type PriorityInfo } from "@/lib/utils/priority"

export interface DashboardKPIs {
  totalApplications: number
  completedDossiers: number
  incompleteDossiers: number
  toVerifyDossiers: number
  pendingComplements: number
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
  eligibilityResult: string
  eligibilityLabel: string
  problemText: string
  deadline: Date | null
  deadlineFormatted: string
  priority: PriorityInfo
  isUrgent: boolean
  totalAmount: number
  requestedAmount: number
  submittedAt: Date | null
}

export async function getDashboardData() {
  try {
    const now = new Date()
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    // Execute queries in parallel
    const [
      applicationsCount,
      completedChecksCount,
      incompleteChecksCount,
      toVerifyCount,
      pendingComplementsCount,
      urgentComplementsCount,
      allApplications,
      complianceChecks,
      eligibilityAssessments,
      upcomingComplements,
    ] = await Promise.all([
      // 1. Demandes reçues
      prisma.application.count().catch(() => 0),

      // 2. Dossiers complets
      prisma.complianceCheck
        .count({
          where: {
            OR: [
              { status: { in: ["COMPLET", "complet", "COMPLETE"] } },
              { completenessRate: { gte: 100 } },
            ],
          },
        })
        .catch(() => 0),

      // 3. Dossiers incomplets
      prisma.complianceCheck
        .count({
          where: {
            OR: [
              { status: { in: ["INCOMPLET", "incomplet", "INCOMPLETE"] } },
              { completenessRate: { lt: 100 } },
            ],
          },
        })
        .catch(() => 0),

      // 4. Dossiers à vérifier
      prisma.application
        .count({
          where: {
            status: {
              in: ["A_VERIFIER", "à_vérifier", "SUBMITTED", "submitted", "EN_COURS"],
            },
          },
        })
        .catch(() => 0),

      // 5. Compléments en attente
      prisma.complementRequest
        .count({
          where: {
            status: { in: ["EN_ATTENTE", "en_attente", "PENDING", "pending"] },
          },
        })
        .catch(() => 0),

      // 6. Dossiers urgents (deadline <= 48h)
      prisma.complementRequest
        .count({
          where: {
            deadline: { lte: in48Hours },
            status: { in: ["EN_ATTENTE", "en_attente", "PENDING", "pending"] },
          },
        })
        .catch(() => 0),

      // Applications list for table & status distribution
      prisma.application
        .findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            program: true,
            complianceCheck: true,
            eligibilityAssessment: true,
            complementRequests: {
              orderBy: { deadline: "asc" },
              take: 1,
            },
          },
        })
        .catch(() => []),

      // Compliance checks for distribution
      prisma.complianceCheck
        .findMany({
          select: { completenessRate: true },
          take: 200,
        })
        .catch(() => []),

      // Eligibility assessments for distribution
      prisma.eligibilityAssessment
        .findMany({
          select: { result: true },
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
      A_VERIFIER: "var(--color-amber-500, #f59e0b)",
      COMPLET: "var(--color-emerald-500, #10b981)",
      INCOMPLET: "var(--color-rose-500, #f43f5e)",
      COMPLEMENT_DEMANDE: "var(--color-blue-500, #3b82f6)",
      ELIGIBLE: "var(--color-emerald-600, #059669)",
      NON_ELIGIBLE: "var(--color-stone-700, #44403c)",
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

    // --- Eligibility Distribution ---
    const eligMap = new Map<string, number>()
    eligibilityAssessments.forEach((e) => {
      const res = (e.result || "NON_EVALUE").toUpperCase()
      eligMap.set(res, (eligMap.get(res) || 0) + 1)
    })

    const eligColors: Record<string, string> = {
      ELIGIBLE: "var(--color-emerald-500, #10b981)",
      NON_ELIGIBLE: "var(--color-rose-500, #f43f5e)",
      A_REVOIR: "var(--color-amber-500, #f59e0b)",
      ATTENTION: "var(--color-amber-500, #f59e0b)",
      NON_EVALUE: "var(--color-stone-400, #a8a29e)",
    }

    const eligibilityDistribution: EligibilityDistributionItem[] = Array.from(eligMap.entries()).map(
      ([result, count]) => ({
        result,
        label: formatEligibilityLabel(result),
        count,
        fill: eligColors[result] || "var(--color-stone-400, #a8a29e)",
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

    // --- "À traiter" Prioritized Table Rows ---
    const dossiersATraiter: DossierRowItem[] = allApplications.map((app) => {
      const comp = app.complianceCheck
      const elig = app.eligibilityAssessment
      const compl = app.complementRequests?.[0]

      const completenessRate = comp ? Number(comp.completenessRate || 0) : 0
      const missingCount = comp?.missingCount || 0
      const expiredCount = comp?.expiredCount || 0

      // Compute human-friendly problem string
      let problemText = "—"
      if (missingCount > 0 && expiredCount > 0) {
        problemText = `${missingCount} doc. manquant${missingCount > 1 ? "s" : ""}, ${expiredCount} expiré${expiredCount > 1 ? "s" : ""}`
      } else if (missingCount > 0) {
        problemText = `${missingCount} pièce${missingCount > 1 ? "s" : ""} manquante${missingCount > 1 ? "s" : ""}`
      } else if (expiredCount > 0) {
        problemText = `${expiredCount} pièce${expiredCount > 1 ? "s" : ""} expirée${expiredCount > 1 ? "s" : ""}`
      } else if (elig?.failedCriteria && elig.failedCriteria.length > 0) {
        problemText = `${elig.failedCriteria.length} critère${elig.failedCriteria.length > 1 ? "s" : ""} non conforme${elig.failedCriteria.length > 1 ? "s" : ""}`
      } else if (app.status === "A_VERIFIER" || app.status === "SUBMITTED") {
        problemText = "Vérification requise"
      }

      const deadline = compl?.deadline ? new Date(compl.deadline) : null
      const deadlineFormatted = deadline
        ? deadline.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
        : "—"

      const priority = computePriority({
        deadline,
        missingCount,
        expiredCount,
        eligibilityResult: elig?.result,
      })

      const refShort = `APP-${app.applicationId.slice(0, 6).toUpperCase()}`

      return {
        id: app.id,
        applicationId: app.applicationId,
        reference: refShort,
        applicantName: `${app.firstName} ${app.lastName}`,
        programName: app.program?.name || app.programId,
        status: app.status || "SUBMITTED",
        statusLabel: formatStatusLabel(app.status || "SUBMITTED"),
        completenessRate,
        eligibilityResult: elig?.result || "NON_EVALUE",
        eligibilityLabel: formatEligibilityLabel(elig?.result || "NON_EVALUE"),
        problemText,
        deadline,
        deadlineFormatted,
        priority,
        isUrgent: priority.level === "HAUTE",
        totalAmount: Number(app.totalAmount || 0),
        requestedAmount: Number(app.requestedAmount || 0),
        submittedAt: app.submittedAt ? new Date(app.submittedAt) : null,
      }
    })

    // Sort prioritized table: HAUTE first, then MOYENNE, then BASSE
    dossiersATraiter.sort((a, b) => {
      const order: Record<string, number> = { HAUTE: 0, MOYENNE: 1, BASSE: 2 }
      const diff = order[a.priority.level] - order[b.priority.level]
      if (diff !== 0) return diff
      if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime()
      return 0
    })

    return {
      kpis: {
        totalApplications: applicationsCount,
        completedDossiers: completedChecksCount,
        incompleteDossiers: incompleteChecksCount,
        toVerifyDossiers: toVerifyCount,
        pendingComplements: pendingComplementsCount,
        urgentDossiers: urgentComplementsCount,
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
        toVerifyDossiers: 0,
        pendingComplements: 0,
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

function formatStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "SUBMITTED":
      return "Reçu"
    case "A_VERIFIER":
      return "À vérifier"
    case "COMPLET":
      return "Complet"
    case "INCOMPLET":
      return "Incomplet"
    case "COMPLEMENT_DEMANDE":
      return "Complément demandé"
    case "ELIGIBLE":
      return "Éligible"
    case "NON_ELIGIBLE":
      return "Non éligible"
    case "TRAITE":
      return "Traité"
    default:
      return status
  }
}

function formatEligibilityLabel(result: string): string {
  switch (result.toUpperCase()) {
    case "ELIGIBLE":
      return "Éligible"
    case "NON_ELIGIBLE":
      return "Non éligible"
    case "A_REVOIR":
      return "À revoir"
    case "ATTENTION":
      return "Attention"
    case "NON_EVALUE":
      return "Non évalué"
    default:
      return result
  }
}
