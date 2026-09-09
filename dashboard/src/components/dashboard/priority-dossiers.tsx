import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { DossierRowItem } from "@/lib/queries/dashboard"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface PriorityDossiersProps {
  dossiers: DossierRowItem[]
}

const priorityBarClass: Record<string, string> = {
  HAUTE: "bg-rose-500",
  MOYENNE: "bg-amber-500",
  BASSE: "bg-emerald-500",
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  switch (status.toUpperCase()) {
    case "COMPLET":
      return (
        <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium h-5">
          {label}
        </Badge>
      )
    case "INCOMPLET":
      return (
        <Badge variant="outline" className="border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-medium h-5">
          {label}
        </Badge>
      )
    case "A_VERIFIER":
    case "SUBMITTED":
      return (
        <Badge variant="outline" className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium h-5">
          {label}
        </Badge>
      )
    case "COMPLEMENT_DEMANDE":
      return (
        <Badge variant="outline" className="border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-medium h-5">
          {label}
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-medium h-5">
          {label}
        </Badge>
      )
  }
}

export function PriorityDossiers({ dossiers }: PriorityDossiersProps) {
  const top = dossiers.slice(0, 5)

  return (
    <section aria-label="À instruire en priorité" className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            À instruire en priorité
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Les dossiers les plus urgents nécessitant votre attention.
          </p>
        </div>
        <Link
          href="/dashboard/dossiers"
          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-2"
        >
          Voir tous les dossiers
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-card p-6 text-center text-xs text-muted-foreground shadow-xs">
          Aucun dossier à traiter pour le moment.
        </div>
      ) : (
        <div className="space-y-2">
          {top.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/dossiers/${item.applicationId}`}
              className="group flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-card shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
            >
              <span
                className={`w-1 self-stretch shrink-0 rounded-full ${priorityBarClass[item.priority.level]}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-primary transition-colors">
                    {item.reference}
                  </span>
                  <StatusBadge status={item.status} label={item.statusLabel} />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                  <span className="truncate font-medium text-stone-700 dark:text-stone-300">
                    {item.applicantName}
                  </span>
                  <span>·</span>
                  <span className="truncate">{item.programName}</span>
                </div>
              </div>

              <div className="hidden sm:block max-w-55 shrink-0 text-xs truncate">
                <span
                  className={
                    item.problemText !== "—"
                      ? "text-rose-600 dark:text-rose-400 font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {item.problemText}
                </span>
              </div>

              {item.deadline && (
                <span
                  className={`shrink-0 font-mono text-xs ${
                    item.isUrgent
                      ? "text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  {item.deadlineFormatted}
                </span>
              )}

              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={2}
                className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
