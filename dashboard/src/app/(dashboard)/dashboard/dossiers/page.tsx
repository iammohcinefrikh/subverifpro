import { Metadata } from "next"
import { getDossiers, isDossierType, type DossierType } from "@/lib/queries/dossiers"
import { DossiersTable } from "@/components/dashboard/dossiers-table"
import { DossiersListSkeleton } from "@/components/dashboard/dossiers-list-skeleton"
import { NavigationPendingShell } from "@/components/navigation-pending"

export const metadata: Metadata = {
  title: "Dossiers",
  description: "Liste des dossiers de subvention et filtres par type",
}

export const dynamic = "force-dynamic"

const typeLabels: Record<DossierType, string> = {
  "recues": "Dossiers reçus",
  "complets": "Dossiers complets",
  "incomplets": "Dossiers incomplets",
  "urgents": "Dossiers urgents",
  "en-traitement": "Dossiers en traitement",
  "eligibles": "Dossiers éligibles",
  "non-eligibles": "Dossiers non éligibles",
}

const typeDescriptions: Record<DossierType, string> = {
  "recues": "Tous les dossiers que vous avez reçus.",
  "complets": "Dossiers qui rassemblent toutes les pièces demandées.",
  "incomplets": "Dossiers auxquels il manque une ou plusieurs pièces.",
  "urgents": "Dossiers dont le projet démarre dans les 10 prochains jours.",
  "en-traitement": "Dossiers en cours d'examen.",
  "eligibles": "Dossiers qui remplissent les conditions pour obtenir la subvention.",
  "non-eligibles": "Dossiers qui ne remplissent pas les conditions pour obtenir la subvention.",
}

export default async function DossiersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>
}) {
  const { type: typeParam } = await searchParams
  const rawType = Array.isArray(typeParam) ? typeParam[0] : typeParam
  const type = isDossierType(rawType) ? rawType : undefined
  const dossiers = await getDossiers(type)

  const title = type ? typeLabels[type] : "Tous les dossiers"
  const description = type
    ? typeDescriptions[type]
    : "Vue d'ensemble de tous les dossiers de subvention."

  return (
    <div className="space-y-4">
      <NavigationPendingShell fallback={<DossiersListSkeleton />}>
        <DossiersTable
          dossiers={dossiers}
          title={title}
          description={description}
          from={type ?? "all"}
          // Filtering by status client-side makes sense on the consolidated and
          // "Reçus" views, since both span several statuses.
          showStatusFilter={!type || type === "recues"}
        />
      </NavigationPendingShell>
    </div>
  )
}
