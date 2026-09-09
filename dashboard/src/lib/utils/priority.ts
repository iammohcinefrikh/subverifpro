export type PriorityLevel = "HAUTE" | "MOYENNE" | "BASSE"

export interface PriorityInfo {
  level: PriorityLevel
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
}

/**
 * Computes dynamic priority from:
 * - Deadline proximity (< 48h = Urgent / HAUTE, < 7d = MOYENNE)
 * - Missing / expired document counts (> 2 = HAUTE, > 0 = MOYENNE)
 * - Eligibility result ("NON_ELIGIBLE" or "A_REVOIR" = HAUTE)
 */
export function computePriority({
  deadline,
  missingCount = 0,
  expiredCount = 0,
  eligibilityResult,
}: {
  deadline?: Date | string | null
  missingCount?: number
  expiredCount?: number
  eligibilityResult?: string | null
}): PriorityInfo {
  let isOverdueOrUrgent = false
  let isApproachingDeadline = false

  if (deadline) {
    const d = new Date(deadline)
    const now = new Date()
    const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours <= 48) {
      isOverdueOrUrgent = true
    } else if (diffHours <= 24 * 7) {
      isApproachingDeadline = true
    }
  }

  const issuesCount = (missingCount || 0) + (expiredCount || 0)
  const isFailedOrReview =
    eligibilityResult?.toUpperCase() === "NON_ELIGIBLE" ||
    eligibilityResult?.toUpperCase() === "A_REVOIR" ||
    eligibilityResult?.toUpperCase() === "REJECTED"

  if (isOverdueOrUrgent || issuesCount >= 2 || isFailedOrReview) {
    return {
      level: "HAUTE",
      label: "Urgente",
      colorClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-50 dark:bg-rose-950/40",
      borderClass: "border-rose-200 dark:border-rose-800",
    }
  }

  if (isApproachingDeadline || issuesCount > 0) {
    return {
      level: "MOYENNE",
      label: "Moyenne",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/40",
      borderClass: "border-amber-200 dark:border-amber-800",
    }
  }

  return {
    level: "BASSE",
    label: "Normale",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  }
}
