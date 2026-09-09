import { prisma } from "@/lib/prisma"
import { computePriority, type PriorityInfo } from "@/lib/utils/priority"

export interface DossierDetailData {
  application: {
    id: string
    applicationId: string
    reference: string
    programId: string
    programName: string
    cin: string
    firstName: string
    lastName: string
    fullName: string
    dateOfBirth: string | null
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
    region: string | null
    structureType: string | null
    nomOuRaisonSociale: string | null
    secteurActivite: string | null
    ancienneteAnnees: number | null
    projectObject: string | null
    projectDescription: string | null
    projectStartDate: string | null
    projectEndDate: string | null
    totalAmount: number
    requestedAmount: number
    status: string
    statusLabel: string
    submittedAt: string | null
    priority: PriorityInfo
  }
  compliance: {
    completenessRate: number
    status: string
    mandatoryCount: number
    presentCount: number
    missingCount: number
    expiredCount: number
    presentDocuments: Array<{ name: string; url?: string; date?: string }>
    missingDocuments: Array<{ name: string; type?: string }>
    expiredDocuments: Array<{ name: string; expiredDate?: string }>
  }
  eligibility: {
    score: number
    result: string
    resultLabel: string
    failedCriteria: string[]
    checks: Array<{
      id: string
      criterionCode: string
      criterionLabel: string
      status: string
      detail: string | null
      pointsAwarded: number | null
    }>
  }
  complements: Array<{
    id: string
    missingDocs: string[]
    deadline: string
    deadlineDate: Date
    isUrgent: boolean
    status: string
    receivedAt: string | null
  }>
  aiAnalysis: {
    summary: string | null
    budgetCoherence: string | null
    budgetComment: string | null
    qualityScore: number | null
    risks: string[]
    strengths: string[]
    focusPoints: string[]
    recommendation: string | null
    modelName: string | null
  } | null
  history: Array<{
    id: string
    eventType: string
    description: string
    createdAt: string
    userName: string
  }>
}

export async function getDossierDetail(id: string): Promise<DossierDetailData | null> {
  try {
    // Lookup by application_id (UUID) or id (UUID)
    const app = await prisma.application.findFirst({
      where: {
        OR: [
          { applicationId: id },
          { id: id },
        ],
      },
      include: {
        program: {
          include: {
            eligibilityCriteria: true,
          },
        },
        complianceCheck: true,
        eligibilityAssessment: {
          include: {
            checks: {
              include: {
                criterion: true,
              },
            },
          },
        },
        complementRequests: {
          orderBy: { deadline: "asc" },
        },
        aiAnalyses: {
          orderBy: { analyzedAt: "desc" },
          take: 1,
        },
        dossierEvents: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    })

    if (!app) {
      return null
    }

    const comp = app.complianceCheck
    const elig = app.eligibilityAssessment
    const latestCompl = app.complementRequests?.[0]
    const latestAi = app.aiAnalyses?.[0]

    const deadline = latestCompl?.deadline ? new Date(latestCompl.deadline) : null
    const missingCount = comp?.missingCount || 0
    const expiredCount = comp?.expiredCount || 0

    const priority = computePriority({
      deadline,
      missingCount,
      expiredCount,
      eligibilityResult: elig?.result,
    })

    // Build a lookup (document_type -> canonical name) from the program's
    // requirements so documents recorded by their short code (e.g. "rib") can
    // be displayed with their full label (e.g. "Relevé d'identité bancaire").
    const requirementLabels = new Map<string, string>()
    const programRequirements = app.program?.requirements
    if (Array.isArray(programRequirements)) {
      for (const item of programRequirements) {
        if (item && typeof item === "object") {
          const req = item as Record<string, unknown>
          if (req.document_type && req.name) {
            requirementLabels.set(String(req.document_type), String(req.name))
          }
        }
      }
    }

    // Resolves the document_type/type key of an item regardless of its shape
    // (compliance documents are stored either as a bare string key or as an
    // object carrying `document_type` / `type`).
    const docKey = (d: unknown): string | undefined => {
      if (typeof d === "string") return d
      if (d && typeof d === "object" && !Array.isArray(d)) {
        const rec = d as Record<string, unknown>
        for (const field of ["document_type", "type", "name"]) {
          const value = rec[field]
          if (typeof value === "string" && value) return value
        }
      }
      return undefined
    }

    // Parse JSON documents safely
    const presentDocs = Array.isArray(comp?.presentDocuments)
      ? (comp.presentDocuments as any[]).map((d) => {
          const obj = d && typeof d === "object"
          const code = docKey(d)
          const label = code && requirementLabels.get(code)
          return {
            name: label ?? (obj ? d.name || d.label || "Document" : String(d)),
            url: obj ? d.url : undefined,
            date: obj ? d.date : undefined,
          }
        })
      : []

    const missingDocs = Array.isArray(comp?.missingDocuments)
      ? (comp.missingDocuments as any[]).map((d) => {
          const obj = d && typeof d === "object"
          const code = docKey(d)
          const label = code && requirementLabels.get(code)
          return {
            name: label ?? (obj ? d.name || d.label || "Document manquant" : String(d)),
            type: obj ? d.type : undefined,
          }
        })
      : []

    const expiredDocs = Array.isArray(comp?.expiredDocuments)
      ? (comp.expiredDocuments as any[]).map((d) => {
          const obj = d && typeof d === "object"
          const code = docKey(d)
          const label = code && requirementLabels.get(code)
          return {
            name: label ?? (obj ? d.name || d.label || "Document expiré" : String(d)),
            expiredDate: obj ? d.expiredDate : undefined,
          }
        })
      : []

    // Map eligibility checks with criterion labels
    const checks = (elig?.checks || []).map((chk) => {
      const criterionLabel =
        chk.criterion?.criterionLabel ||
        app.program?.eligibilityCriteria?.find((c) => c.criterionCode === chk.criterionCode)
          ?.criterionLabel ||
        chk.criterionCode

      return {
        id: chk.id,
        criterionCode: chk.criterionCode,
        criterionLabel,
        status: chk.status,
        detail: chk.detail,
        pointsAwarded: chk.pointsAwarded,
      }
    })

    const now = new Date()

    return {
      application: {
        id: app.id,
        applicationId: app.applicationId,
        reference: `APP-${app.applicationId.slice(0, 6).toUpperCase()}`,
        programId: app.programId,
        programName: app.program?.name || app.programId,
        cin: app.cin,
        firstName: app.firstName,
        lastName: app.lastName,
        fullName: `${app.firstName} ${app.lastName}`,
        dateOfBirth: app.dateOfBirth ? app.dateOfBirth.toISOString().split("T")[0] : null,
        phone: app.phone,
        email: app.email,
        address: app.address,
        city: app.city,
        region: app.region,
        structureType: app.structureType,
        nomOuRaisonSociale: app.nomOuRaisonSociale,
        secteurActivite: app.secteurActivite,
        ancienneteAnnees: app.ancienneteAnnees,
        projectObject: app.projectObject,
        projectDescription: app.projectDescription,
        projectStartDate: app.projectStartDate ? app.projectStartDate.toISOString().split("T")[0] : null,
        projectEndDate: app.projectEndDate ? app.projectEndDate.toISOString().split("T")[0] : null,
        totalAmount: Number(app.totalAmount || 0),
        requestedAmount: Number(app.requestedAmount || 0),
        status: app.status || "SUBMITTED",
        statusLabel: formatStatus(app.status || "SUBMITTED"),
        submittedAt: app.submittedAt ? app.submittedAt.toISOString() : null,
        priority,
      },
      compliance: {
        completenessRate: Number(comp?.completenessRate || 0),
        status: comp?.status || "INCONNU",
        mandatoryCount: comp?.mandatoryDocumentsCount || 0,
        presentCount: comp?.presentCount || presentDocs.length,
        missingCount: comp?.missingCount || missingDocs.length,
        expiredCount: comp?.expiredCount || expiredDocs.length,
        presentDocuments: presentDocs,
        missingDocuments: missingDocs,
        expiredDocuments: expiredDocs,
      },
      eligibility: {
        score: elig?.eligibilityScore ?? 0,
        result: (elig?.result || "NON_EVALUE").toUpperCase(),
        resultLabel: formatEligibility(elig?.result || "NON_EVALUE"),
        failedCriteria: elig?.failedCriteria || [],
        checks,
      },
      complements: (app.complementRequests || []).map((c) => {
        const d = new Date(c.deadline)
        const diffMs = d.getTime() - now.getTime()
        const isUrgent = diffMs <= 48 * 60 * 60 * 1000

        return {
          id: c.id,
          missingDocs: c.missingDocs || [],
          deadline: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
          deadlineDate: d,
          isUrgent,
          status: c.status || "EN_ATTENTE",
          receivedAt: c.receivedAt ? c.receivedAt.toLocaleDateString("fr-FR") : null,
        }
      }),
      aiAnalysis: latestAi
        ? {
            summary: latestAi.summaryFr,
            budgetCoherence: latestAi.budgetCoherence,
            budgetComment: latestAi.budgetComment,
            qualityScore: latestAi.projectQualityScore,
            risks: latestAi.riskFlags || [],
            strengths: latestAi.strengths || [],
            focusPoints: latestAi.instructorFocusPoints || [],
            recommendation: latestAi.overallRecommendation,
            modelName: latestAi.modelName,
          }
        : null,
      history: (app.dossierEvents || []).map((evt) => ({
        id: evt.id,
        eventType: evt.eventType,
        description: evt.description,
        createdAt: evt.createdAt
          ? new Date(evt.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
        userName: evt.user?.name || "Système",
      })),
    }
  } catch (error) {
    console.error("Error fetching dossier detail:", error)
    return null
  }
}

function formatStatus(s: string) {
  switch (s.toUpperCase()) {
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
    default:
      return s
  }
}

function formatEligibility(res: string) {
  switch (res.toUpperCase()) {
    case "ELIGIBLE":
      return "Éligible"
    case "NON_ELIGIBLE":
      return "Non éligible"
    case "A_REVOIR":
    case "ATTENTION":
      return "À réexaminer"
    case "NON_EVALUE":
      return "Non évalué"
    default:
      return res
  }
}
