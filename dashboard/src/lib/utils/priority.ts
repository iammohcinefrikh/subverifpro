export type PriorityLevel = "HAUTE" | "MOYENNE" | "BASSE"

export interface PriorityInfo {
  level: PriorityLevel
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
  /** Numeric triage score (0–100) used to order dossiers. */
  score: number
}

const LEVEL_STYLES: Record<PriorityLevel, Omit<PriorityInfo, "level" | "score">> = {
  HAUTE: {
    label: "Urgente",
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    borderClass: "border-rose-200 dark:border-rose-800",
  },
  MOYENNE: {
    label: "Moyenne",
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  BASSE: {
    label: "Normale",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  },
}

/**
 * Urgency contribution (0–50) based on how soon the project starts.
 * A date in the past or within 10 days is the most urgent.
 */
function urgencyPoints(date?: Date | string | null): number {
  if (!date) return 0
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 10) return 50
  if (days <= 20) return 35
  if (days <= 30) return 20
  if (days <= 60) return 10
  return 0
}

/**
 * Computes a triage priority from two signals:
 * - urgency: project start date proximity (falls back to the complement deadline)
 * - eligibility score: `application_eligibility_results.total_points` (0–100)
 *
 * Priority score = urgency (0–50) + eligibility (total_points × 0.5, 0–50).
 * Levels: score ≥ 70 → HAUTE, 40–69 → MOYENNE, < 40 → BASSE.
 */
export function computePriority({
  projectStartDate,
  deadline,
  eligibilityScore,
}: {
  projectStartDate?: Date | string | null
  deadline?: Date | string | null
  eligibilityScore?: number | null
}): PriorityInfo {
  const urgency = urgencyPoints(projectStartDate ?? deadline)
  const clampedEligibility =
    typeof eligibilityScore === "number" ? Math.max(0, Math.min(100, eligibilityScore)) : 0
  const score = Math.min(100, urgency + Math.round(clampedEligibility / 2))

  const level: PriorityLevel = score >= 70 ? "HAUTE" : score >= 40 ? "MOYENNE" : "BASSE"

  return { level, score, ...LEVEL_STYLES[level] }
}
