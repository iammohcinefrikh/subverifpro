import { prisma } from "@/lib/prisma"
import {
  dossierInclude,
  mapApplicationToDossierRow,
  type DossierRowItem,
} from "@/lib/queries/dashboard"

export type DossierType =
  | "a-verifier"
  | "complets"
  | "incomplets"
  | "en-attente"
  | "urgents"

export const DOSSIER_TYPE_VALUES: DossierType[] = [
  "a-verifier",
  "complets",
  "incomplets",
  "en-attente",
  "urgents",
]

export function isDossierType(value: string | undefined): value is DossierType {
  return DOSSIER_TYPE_VALUES.includes(value as DossierType)
}

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
  if (!type) return rows

  switch (type) {
    case "a-verifier":
      return rows.filter((d) =>
        ["A_VERIFIER", "SUBMITTED", "EN_COURS"].includes(d.status.toUpperCase())
      )
    case "complets":
      return rows.filter((d) => d.hasComplianceCheck && d.completenessRate >= 100)
    case "incomplets":
      return rows.filter((d) => d.hasComplianceCheck && d.completenessRate < 100)
    case "en-attente":
      return rows.filter((d) => d.hasPendingComplement)
    case "urgents":
      return rows.filter((d) => d.priority.level === "HAUTE")
  }
}
