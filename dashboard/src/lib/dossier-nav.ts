/**
 * Client-safe helpers shared by the sidebar, breadcrumbs and dossier links.
 * Kept free of Prisma imports so client components can use it.
 */

export type DossierType =
  | "recues"
  | "complets"
  | "incomplets"
  | "urgents"
  | "en-traitement"
  | "eligibles"
  | "non-eligibles"

export const DOSSIER_TYPE_VALUES: DossierType[] = [
  "recues",
  "complets",
  "incomplets",
  "urgents",
  "en-traitement",
  "eligibles",
  "non-eligibles",
]

export function isDossierType(value: string | null | undefined): value is DossierType {
  return DOSSIER_TYPE_VALUES.includes(value as DossierType)
}

/** Short labels, as used in the sidebar navigation and breadcrumbs. */
export const DOSSIER_TYPE_LABELS: Record<DossierType, string> = {
  recues: "Reçus",
  complets: "Complets",
  incomplets: "Incomplets",
  urgents: "Urgents",
  "en-traitement": "En traitement",
  eligibles: "Éligibles",
  "non-eligibles": "Non Éligibles",
}

export const DASHBOARD_HREF = "/dashboard"
export const ALL_DOSSIERS_HREF = "/dashboard/dossiers"
export const ALL_DOSSIERS_LABEL = "Dossiers"

export function dossiersTypeHref(type: DossierType): string {
  return `${ALL_DOSSIERS_HREF}?type=${type}`
}

/**
 * A list page a dossier can be opened from, encoded as the `from` search param
 * on the detail URL so the back button and breadcrumb can return to it.
 *
 * - a dossier type key ("recues", "complets", ...) -> the filtered list
 * - "dashboard" -> the overview page
 * - "all" (or anything else / missing) -> the consolidated dossiers list
 */
export type DossierOriginKey = DossierType | "dashboard" | "all"

export function parseDossierOrigin(
  value: string | null | undefined
): DossierOriginKey {
  if (value === "dashboard") return "dashboard"
  if (isDossierType(value)) return value
  return "all"
}

export interface DossierOrigin {
  href: string
  label: string
}

/** Resolves a `from` key into the href/label used for the back button. */
export function resolveDossierOrigin(value: string | null | undefined): DossierOrigin {
  const origin = parseDossierOrigin(value)

  if (origin === "dashboard") {
    return { href: DASHBOARD_HREF, label: "Vue d'ensemble" }
  }

  if (origin === "all") {
    return { href: ALL_DOSSIERS_HREF, label: ALL_DOSSIERS_LABEL }
  }

  return { href: dossiersTypeHref(origin), label: DOSSIER_TYPE_LABELS[origin] }
}