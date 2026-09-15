/**
 * Single source of truth for dossier "tones", so status badges, action buttons
 * and KPI cards always use the same colour for the same meaning.
 *
 * Client-safe: imports nothing, so it can be used from server and client
 * components alike.
 */
export type StatusTone = "emerald" | "amber" | "blue" | "rose" | "teal" | "stone"

export interface ToneClasses {
  /** Soft badge surface: tinted border + background + text. */
  badge: string
  /** Soft, borderless (tinted, never filled) action button from the same palette. */
  button: string
  /** KPI icon accent colour. */
  accent: string
  /** KPI icon chip background. */
  chip: string
  /** KPI card border. */
  border: string
}

export const TONE_CLASSES: Record<StatusTone, ToneClasses> = {
  // CONFORME / ACCEPTED — dossier validated.
  emerald: {
    badge:
      "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    button:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-950/70 dark:hover:text-emerald-200",
    accent: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-50/80 dark:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-900/40",
  },
  // INCOMPLETE — missing pieces.
  amber: {
    badge:
      "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    button:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950/70 dark:hover:text-amber-200",
    accent: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-50/80 dark:bg-amber-950/30",
    border: "border-amber-200/60 dark:border-amber-900/40",
  },
  // PENDING — being instructed.
  blue: {
    badge:
      "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    button:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-950/70 dark:hover:text-blue-200",
    accent: "text-blue-600 dark:text-blue-400",
    chip: "bg-blue-50/80 dark:bg-blue-950/30",
    border: "border-blue-200/60 dark:border-blue-900/40",
  },
  // REJECTED — turned down.
  rose: {
    badge:
      "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    button:
      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 hover:text-rose-800 dark:hover:bg-rose-950/70 dark:hover:text-rose-200",
    accent: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-300 dark:border-rose-800",
  },
  // Eligibility PASS — distinct from "complet" so both KPIs stay readable.
  teal: {
    badge:
      "border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
    button:
      "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 hover:text-teal-800 dark:hover:bg-teal-950/70 dark:hover:text-teal-200",
    accent: "text-teal-600 dark:text-teal-400",
    chip: "bg-teal-50/80 dark:bg-teal-950/30",
    border: "border-teal-200/60 dark:border-teal-900/40",
  },
  // Neutral / not yet qualified.
  stone: {
    badge:
      "border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
    button:
      "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 hover:text-stone-900 dark:hover:bg-stone-700 dark:hover:text-stone-100",
    accent: "text-stone-700 dark:text-stone-300",
    chip: "bg-stone-100 dark:bg-stone-800/80",
    border: "border-stone-200 dark:border-stone-800",
  },
}

/** Canonical tone for an application status. */
export function statusTone(status: string): StatusTone {
  switch (status.toUpperCase()) {
    case "CONFORME":
    case "ACCEPTED":
      return "emerald"
    case "INCOMPLETE":
      return "amber"
    case "PENDING":
      return "blue"
    case "REJECTED":
      return "rose"
    default:
      return "stone"
  }
}

/** Tinted badge surface for a status. */
export function statusBadgeClass(status: string): string {
  return TONE_CLASSES[statusTone(status)].badge
}

/** Tinted (not filled) action button surface for the status it produces. */
export function statusButtonClass(status: string): string {
  return TONE_CLASSES[statusTone(status)].button
}