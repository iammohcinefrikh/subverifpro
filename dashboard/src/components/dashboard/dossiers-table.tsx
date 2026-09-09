"use client"

import * as React from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DossierRowItem } from "@/lib/queries/dashboard"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

interface DossiersTableProps {
  dossiers: DossierRowItem[]
  title: string
  description: string
  /** Show the client-side "statut" select — only meaningful for the "Tous les dossiers" view. */
  showStatusFilter: boolean
}

const statusOptions: { value: string; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "SUBMITTED", label: "Reçu" },
  { value: "A_VERIFIER", label: "À vérifier" },
  { value: "COMPLET", label: "Complet" },
  { value: "INCOMPLET", label: "Incomplet" },
  { value: "COMPLEMENT_DEMANDE", label: "Complément demandé" },
]

const priorityOptions: { value: string; label: string }[] = [
  { value: "ALL", label: "Toutes priorités" },
  { value: "HAUTE", label: "Haute (Urgents)" },
  { value: "MOYENNE", label: "Moyenne" },
  { value: "BASSE", label: "Normale" },
]

const statusLabelByValue: Record<string, string> = Object.fromEntries(
  statusOptions.map((o) => [o.value, o.label])
)
const priorityLabelByValue: Record<string, string> = Object.fromEntries(
  priorityOptions.map((o) => [o.value, o.label])
)

export function DossiersTable({
  dossiers,
  title,
  description,
  showStatusFilter,
}: DossiersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10

  const filteredDossiers = React.useMemo(() => {
    return dossiers.filter((item) => {
      const matchSearch =
        searchTerm === "" ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.problemText.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus =
        !showStatusFilter || statusFilter === "ALL" || item.status.toUpperCase() === statusFilter.toUpperCase()

      const matchPriority =
        priorityFilter === "ALL" || item.priority.level === priorityFilter

      return matchSearch && matchStatus && matchPriority
    })
  }, [dossiers, searchTerm, statusFilter, priorityFilter, showStatusFilter])

  const totalPages = Math.ceil(filteredDossiers.length / pageSize) || 1
  const paginatedDossiers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDossiers.slice(start, start + pageSize)
  }, [filteredDossiers, currentPage])

  const setSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }
  const setStatus = (value: string | null) => {
    setStatusFilter(value ?? "ALL")
    setCurrentPage(1)
  }
  const setPriority = (value: string | null) => {
    setPriorityFilter(value ?? "ALL")
    setCurrentPage(1)
  }

  const renderStatusBadge = (status: string, label: string) => {
    switch (status.toUpperCase()) {
      case "COMPLET":
        return (
          <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium h-5">
            {label}
          </Badge>
        )
      case "INCOMPLET":
        return (
          <Badge variant="outline" className="border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-medium h-5">
            {label}
          </Badge>
        )
      case "A_VERIFIER":
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium h-5">
            {label}
          </Badge>
        )
      case "COMPLEMENT_DEMANDE":
        return (
          <Badge variant="outline" className="border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium h-5">
            {label}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium h-5">
            {label}
          </Badge>
        )
    }
  }

  const renderEligibilityIcon = (result: string, label: string) => {
    switch (result.toUpperCase()) {
      case "ELIGIBLE":
        return (
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2.5} className="shrink-0 text-emerald-600" />
            <span>{label}</span>
          </div>
        )
      case "NON_ELIGIBLE":
        return (
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium text-xs">
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2.5} className="shrink-0 text-rose-600" />
            <span>{label}</span>
          </div>
        )
      case "A_REVOIR":
      case "ATTENTION":
        return (
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium text-xs">
            <HugeiconsIcon icon={AlertCircleIcon} size={14} strokeWidth={2.5} className="shrink-0 text-amber-600" />
            <span>{label}</span>
          </div>
        )
      default:
        return (
          <span className="text-stone-400 text-xs">—</span>
        )
    }
  }

  const renderPriorityIcon = (priority: DossierRowItem["priority"]) => {
    switch (priority.level) {
      case "HAUTE":
        return (
          <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold text-xs" title="Priorité Haute (< 48h ou non-conformité)">
            <HugeiconsIcon icon={AlertCircleIcon} size={15} strokeWidth={2.5} className="text-rose-600 dark:text-rose-400" />
            <span className="hidden xl:inline text-[11px]">Haute</span>
          </div>
        )
      case "MOYENNE":
        return (
          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium text-xs" title="Priorité Moyenne">
            <HugeiconsIcon icon={AlertCircleIcon} size={14} strokeWidth={2} className="text-amber-500 dark:text-amber-400" />
            <span className="hidden xl:inline text-[11px]">Moyenne</span>
          </div>
        )
      case "BASSE":
        return (
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-xs" title="Priorité Normale">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2} className="text-emerald-500 dark:text-emerald-400" />
            <span className="hidden xl:inline text-[11px]">Normale</span>
          </div>
        )
    }
  }

  return (
    <div className="space-y-24" id="dossiers-table">
      {/* Header row: title on the left, search + filters on the right */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Rechercher par référence, demandeur..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs border-stone-300 dark:border-stone-700 w-full"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriority}>
            <SelectTrigger className="justify-between">
              <SelectValue>{(v) => priorityLabelByValue[v as string] ?? ""}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showStatusFilter && (
            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="justify-between">
                <SelectValue>{(v) => statusLabelByValue[v as string] ?? ""}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Prioritized Table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-stone-50/80 dark:bg-stone-900/50">
            <TableRow className="hover:bg-transparent border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              <TableHead className="w-30 pl-3 py-2.5">Dossier</TableHead>
              <TableHead className="min-w-37.5 py-2.5">Demandeur</TableHead>
              <TableHead className="w-32.5 py-2.5">Statut</TableHead>
              <TableHead className="w-35 py-2.5">Complétude</TableHead>
              <TableHead className="w-32.5 py-2.5">Éligibilité</TableHead>
              <TableHead className="min-w-45 py-2.5">Problème / Alerte</TableHead>
              <TableHead className="w-25 py-2.5 text-center">Échéance</TableHead>
              <TableHead className="w-22.5 py-2.5 text-center">Priorité</TableHead>
              <TableHead className="w-11.25 pr-3 py-2.5 text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedDossiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-xs text-muted-foreground">
                  Aucun dossier ne correspond aux critères de recherche.
                </TableCell>
              </TableRow>
            ) : (
              paginatedDossiers.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-stone-50/80 dark:hover:bg-stone-900/40 border-b border-stone-200/70 dark:border-stone-800/70 transition-colors"
                >
                  {/* Dossier Ref */}
                  <TableCell className="font-mono text-xs font-semibold py-3 pl-3">
                    <Link
                      href={`/dashboard/dossiers/${item.applicationId}`}
                      className="text-stone-900 dark:text-stone-100 hover:text-primary hover:underline underline-offset-2 flex items-center gap-1 group-hover:text-primary transition-colors"
                    >
                      <span>{item.reference}</span>
                    </Link>
                  </TableCell>

                  {/* Demandeur & Programme */}
                  <TableCell className="py-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">
                        {item.applicantName}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {item.programName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Statut */}
                  <TableCell className="py-3">
                    {renderStatusBadge(item.status, item.statusLabel)}
                  </TableCell>

                  {/* Complétude */}
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          {item.completenessRate}%
                        </span>
                      </div>
                      <Progress
                        value={item.completenessRate}
                        className="h-1.5 bg-stone-100 dark:bg-stone-800"
                      />
                    </div>
                  </TableCell>

                  {/* Éligibilité */}
                  <TableCell className="py-3">
                    {renderEligibilityIcon(item.eligibilityResult, item.eligibilityLabel)}
                  </TableCell>

                  {/* Problème */}
                  <TableCell className="py-3 text-xs text-stone-700 dark:text-stone-300">
                    <span className={item.problemText !== "—" ? "text-rose-600 dark:text-rose-400 font-medium" : "text-muted-foreground"}>
                      {item.problemText}
                    </span>
                  </TableCell>

                  {/* Échéance */}
                  <TableCell className="py-3 text-center font-mono text-xs">
                    <span
                      className={
                        item.isUrgent
                          ? "text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded"
                          : "text-stone-600 dark:text-stone-400"
                      }
                    >
                      {item.deadlineFormatted}
                    </span>
                  </TableCell>

                  {/* Priorité */}
                  <TableCell className="py-3 text-center">
                    <div className="flex justify-center">
                      {renderPriorityIcon(item.priority)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 pr-3 text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 rounded text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/dashboard/dossiers/${item.applicationId}`} title="Voir le détail du dossier">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
                        <span className="sr-only">Voir</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/30 text-xs text-muted-foreground">
          <span className="font-mono">
            Page {currentPage} sur {totalPages} ({filteredDossiers.length} {filteredDossiers.length > 1 ? "dossiers" : "dossier"})
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 text-xs px-2"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 text-xs px-2"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
