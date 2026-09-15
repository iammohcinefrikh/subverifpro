/** Uppercases only the first character, leaving the rest of the string intact. */
export function capitalizeFirst(value: string | null | undefined): string {
  if (!value) return ""
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Formats a date as DD/MM/YYYY.
 *
 * Accepts ISO date strings (e.g. "1990-05-21" or a full ISO timestamp) as well
 * as `Date` instances. Date-only strings are parsed directly to avoid the
 * timezone shift that `new Date("YYYY-MM-DD")` would introduce. Returns an
 * empty string when the value is missing or invalid.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ""

  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) return `${match[3]}/${match[2]}/${match[1]}`
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}/${month}/${date.getFullYear()}`
}

/**
 * Formats a millisecond duration as minutes and seconds, never as raw
 * milliseconds, e.g. 1978 -> "2,0 s", 64974 -> "1 min 5 s", 4500000 -> "1 h 15 min".
 *
 * Returns an em dash when the duration is unknown (`null` / `undefined`), which
 * is how gates that were never measured are rendered.
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "—"

  const totalSeconds = ms / 1000

  if (totalSeconds < 60) {
    const seconds = Math.round(totalSeconds * 10) / 10
    // 59,96 s must roll over to "1 min" rather than round up to "60,0 s".
    if (seconds < 60) return `${seconds.toFixed(1).replace(".", ",")} s`
  }

  const wholeSeconds = Math.round(totalSeconds)
  const minutes = Math.floor(wholeSeconds / 60)
  const seconds = wholeSeconds % 60

  if (minutes < 60) {
    return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes === 0 ? `${hours} h` : `${hours} h ${remainingMinutes} min`
}
