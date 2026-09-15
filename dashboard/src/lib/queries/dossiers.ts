import { prisma } from "@/lib/prisma"
import {
  dossierInclude,
  mapApplicationToDossierRow,
  type DossierRowItem,
} from "@/lib/queries/dashboard"
import { type DossierType } from "@/lib/dossier-nav"

// Re-exported for existing consumers; the definitions live in a client-safe
// module so navigation components can use them without pulling in Prisma.
export {
  DOSSIER_TYPE_VALUES,
  isDossierType,
  type DossierType,
} from "@/lib/dossier-nav"

/** Statuses that are considered "already processed" and therefore excluded from
 *  the eligibility-based views (mirrors the dashboard "Dossiers éligibles" KPI). */
const FINALIZED_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"]

export async function getDossiers(type?: DossierType): Promise<DossierRowItem[]> {
  try {
    const apps = await prisma.application
      .findMany({
        orderBy: { createdAt: "desc" },
        include: dossierInclude,
      })
      .catch(() => [])

    const rows = apps.map(mapApplicationToDossierRow)
    return filterDossiers(rows, type)
  } catch (error) {
    console.error("Error fetching dossiers:", error)
    return []
  }
}

function filterDossiers(rows: DossierRowItem[], type?: DossierType): DossierRowItem[] {
  // No type -> the "Tous" view: every application, regardless of status.
  if (!type) return rows

  switch (type) {
    // Dossiers reçus KPI: applications that reached one of the active statuses.
    case "recues":
      return rows.filter((d) =>
        ["CONFORME", "INCOMPLETE", "PENDING"].includes(d.status.toUpperCase())
      )
    case "complets":
      return rows.filter((d) => d.status.toUpperCase() === "CONFORME")
    case "incomplets":
      return rows.filter((d) => d.status.toUpperCase() === "INCOMPLETE")
    case "urgents":
      return rows.filter((d) => d.isUrgent)
    case "en-traitement":
      return rows.filter((d) => d.status.toUpperCase() === "PENDING")
    // Dossiers éligibles KPI: overall eligibility PASS/WARNING, excluding
    // applications that are PENDING, ACCEPTED or REJECTED.
    case "eligibles":
      return rows.filter(
        (d) =>
          !FINALIZED_STATUSES.includes(d.status.toUpperCase()) &&
          (d.eligibilityResult === "PASS" || d.eligibilityResult === "WARNING")
      )
    // Non éligibles: evaluated as FAIL, excluding the same finalized statuses.
    case "non-eligibles":
      return rows.filter(
        (d) =>
          !FINALIZED_STATUSES.includes(d.status.toUpperCase()) &&
          d.eligibilityResult === "FAIL"
      )
  }
}
