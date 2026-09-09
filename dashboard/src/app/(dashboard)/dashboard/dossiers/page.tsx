import { Metadata } from "next"
import { getDossiers, isDossierType, type DossierType } from "@/lib/queries/dossiers"
import { DossiersTable } from "@/components/dashboard/dossiers-table"

export const metadata: Metadata = {
  title: "Dossiers",
  description: "Liste des dossiers de subvention et filtres par type",
}

export const dynamic = "force-dynamic"

const typeLabels: Record<DossierType, string> = {
  "a-verifier": "Dossiers à vérifier",
  "complets": "Dossiers complets",
  "incomplets": "Dossiers incomplets",
  "en-attente": "Dossiers en attente de complément",
  "urgents": "Dossiers urgents",
}

const typeDescriptions: Record<DossierType, string> = {
  "a-verifier": "Dossiers soumis ou en attente de vérification.",
  "complets": "Dossiers dont la complétude documentaire est atteinte.",
  "incomplets": "Dossiers présentant des pièces manquantes ou expirées.",
  "en-attente": "Dossiers en attente d'un complément de la part du demandeur.",
  "urgents": "Dossiers à traiter en priorité (échéance proche ou non-conformité).",
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
    : "Vue consolidée de l'ensemble des dossiers de subvention."

  return (
    <div className="space-y-4">
      <DossiersTable
        dossiers={dossiers}
        title={title}
        description={description}
        // Filtering by status client-side only makes sense on the consolidated view.
        showStatusFilter={!type}
      />
    </div>
  )
}
