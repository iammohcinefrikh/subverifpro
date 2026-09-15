import { prisma } from "@/lib/prisma"
import { computePriority, type PriorityInfo } from "@/lib/utils/priority"
import {
  normalizeEligibilityStatus,
  formatEligibilityLabel,
  formatStatusLabel,
} from "@/lib/queries/dashboard"

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
    /** Project expenses ("besoins") declared by the applicant. */
    depenses: Array<{ id: string; libelle: string; montant: number }>
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
  aiAnalysis: {
    summary: string | null
    budgetCoherence: string | null
    budgetComment: string | null
    qualityScore: number | null
    risks: string[]
    strengths: string[]
    focusPoints: string[]
    recommendation: string | null
  } | null
}

type ComplianceDocEntry = string | Record<string, unknown>

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
        applicationEligibilityResult: true,
        complementRequests: {
          orderBy: { deadline: "asc" },
        },
        aiAnalysis: true,
      },
    })

    if (!app) {
      return null
    }

    const comp = app.complianceCheck
    const elig = app.applicationEligibilityResult
    const latestCompl = app.complementRequests?.[0]
    const latestAi = app.aiAnalysis

    const eligibilityResult = normalizeEligibilityStatus(elig?.overallStatus)

    const deadline = latestCompl?.deadline ? new Date(latestCompl.deadline) : null

    const priority = computePriority({
      projectStartDate: app.projectStartDate,
      deadline,
      eligibilityScore: elig?.totalPoints ?? null,
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
      ? (comp.presentDocuments as ComplianceDocEntry[]).map((d) => {
          const rec = d && typeof d === "object" && !Array.isArray(d)
            ? (d as Record<string, unknown>)
            : null
          const code = docKey(d)
          const label = code ? requirementLabels.get(code) : undefined
          return {
            name: label ?? (rec ? String(rec.name ?? rec.label ?? "Document") : String(d)),
            url:  rec && typeof rec.url  === "string" ? rec.url  : undefined,
            date: rec && typeof rec.date === "string" ? rec.date : undefined,
          }
        })
      : []

    const missingDocs = Array.isArray(comp?.missingDocuments)
      ? (comp.missingDocuments as ComplianceDocEntry[]).map((d) => {
          const rec = d && typeof d === "object" && !Array.isArray(d)
            ? (d as Record<string, unknown>)
            : null
          const code = docKey(d)
          const label = code ? requirementLabels.get(code) : undefined
          return {
            name: label ?? (rec ? String(rec.name ?? rec.label ?? "Document manquant") : String(d)),
            type: rec && typeof rec.type === "string" ? rec.type : undefined,
          }
        })
      : []

    const expiredDocs = Array.isArray(comp?.expiredDocuments)
      ? (comp.expiredDocuments as ComplianceDocEntry[]).map((d) => {
          const rec = d && typeof d === "object" && !Array.isArray(d)
            ? (d as Record<string, unknown>)
            : null
          const code = docKey(d)
          const label = code ? requirementLabels.get(code) : undefined
          return {
            name: label ?? (rec ? String(rec.name ?? rec.label ?? "Document expiré") : String(d)),
            expiredDate: rec && typeof rec.expiredDate === "string" ? rec.expiredDate : undefined,
          }
        })
      : []

    // Project expenses are stored as a JSON array of `{ id, libelle, montant }`.
    // Malformed entries are skipped rather than rendered as blanks.
    const depenses: Array<{ id: string; libelle: string; montant: number }> = []
    if (Array.isArray(app.depenses)) {
      for (const item of app.depenses) {
        if (!item || typeof item !== "object" || Array.isArray(item)) continue
        const rec = item as Record<string, unknown>
        const libelle = typeof rec.libelle === "string" ? rec.libelle : null
        const montant =
          typeof rec.montant === "number" ? rec.montant : Number(rec.montant)
        if (!libelle || !Number.isFinite(montant)) continue
        depenses.push({
          id: typeof rec.id === "string" ? rec.id : libelle,
          libelle,
          montant,
        })
      }
    }

    // Map the criteria stored on the eligibility result into per-criterion rows.
    // `criteria` is a JSON object keyed by the criterion label, each entry
    // carrying a French `statut` ("Satisfait" / "À vérifier" / ...).
    const criteriaEntries: Array<{ label: string; entry: Record<string, unknown> }> = []
    if (elig?.criteria && typeof elig.criteria === "object" && !Array.isArray(elig.criteria)) {
      for (const [label, entry] of Object.entries(elig.criteria as Record<string, unknown>)) {
        criteriaEntries.push({
          label,
          entry: entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {},
        })
      }
    }

    const toCheckStatus = (statut: unknown): string => {
      const s = String(statut || "").toLowerCase()
      if (s.includes("vérifi") || s.includes("verifi") || s.includes("attente") || s.includes("warning")) {
        return "WARNING"
      }
      if (s.includes("non") || s.includes("fail") || s.includes("échec") || s.includes("echec")) {
        return "FAILED"
      }
      if (s.includes("satisf") || s.includes("pass") || s.includes("valide")) {
        return "PASSED"
      }
      return "WARNING"
    }

    const checks = criteriaEntries.map(({ label, entry }) => ({
      id: label,
      criterionCode: label,
      criterionLabel: label,
      status: toCheckStatus(entry.statut),
      detail: typeof entry.explication === "string" ? entry.explication : null,
      pointsAwarded:
        typeof entry["points obtenus"] === "number" ? (entry["points obtenus"] as number) : null,
    }))

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
        depenses,
        status: app.status || "SUBMITTED",
        statusLabel: formatStatusLabel(app.status || "SUBMITTED"),
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
        score: elig?.totalPoints ?? 0,
        result: eligibilityResult,
        resultLabel: formatEligibilityLabel(eligibilityResult),
        failedCriteria: checks.filter((c) => c.status === "FAILED").map((c) => c.criterionLabel),
        checks,
      },
      aiAnalysis: latestAi
        ? {
            summary: latestAi.summaryFr,
            budgetCoherence: latestAi.budgetCoherence,
            budgetComment: latestAi.budgetComment,
            qualityScore: latestAi.projectQualityScore,
            risks: toStringArray(latestAi.riskFlags),
            strengths: toStringArray(latestAi.strengths),
            focusPoints: toStringArray(latestAi.instructorFocusPoints),
            recommendation: toRecommendation(latestAi.overallRecommendation),
          }
        : null,
    }
  } catch (error) {
    console.error("Error fetching dossier detail:", error)
    return null
  }
}

/** Coerces a Prisma Json array value into a string array. */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === "string")
}

/** The AI recommendation is stored as JSON; display it as a plain string. */
function toRecommendation(value: unknown): string | null {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>
    const candidate = rec.recommendation ?? rec.label ?? rec.value ?? rec.text
    if (typeof candidate === "string") return candidate
  }
  return null
}
