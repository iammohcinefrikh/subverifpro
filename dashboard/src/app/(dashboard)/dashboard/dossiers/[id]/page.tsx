import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDossierDetail } from "@/lib/queries/dossier"
import { resolveDossierOrigin } from "@/lib/dossier-nav"
import { DossierHeader } from "@/components/dossier/dossier-header"
import { DemandeurInfo } from "@/components/dossier/demandeur-info"
import { CompletudeSection } from "@/components/dossier/completude-section"
import { EligibiliteSection } from "@/components/dossier/eligibilite-section"
import { AiSynthesis } from "@/components/dossier/ai-synthesis"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string | string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getDossierDetail(id)

  if (!data) {
    return { title: "Dossier introuvable" }
  }

  return {
    title: `${data.application.reference} — ${data.application.fullName}`,
    description: `Vue détaillée de l'instruction du dossier ${data.application.reference}`,
  }
}

export const dynamic = "force-dynamic"

export default async function DossierDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { from: fromParam } = await searchParams
  const rawFrom = Array.isArray(fromParam) ? fromParam[0] : fromParam
  const data = await getDossierDetail(id)

  if (!data) {
    notFound()
  }

  // Return to the list the user navigated from (falls back to all dossiers).
  const origin = resolveDossierOrigin(rawFrom)

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sticky Navigation & Status Header */}
      <DossierHeader data={data} backHref={origin.href} backLabel={origin.label} />

      {/* 2. Synthèse IA */}
      <section aria-label="Synthèse de l'intelligence artificielle">
        <AiSynthesis aiAnalysis={data.aiAnalysis} />
      </section>

      {/* 3. Informations du demandeur & Projet */}
      <section aria-label="Informations du demandeur">
        <DemandeurInfo application={data.application} />
      </section>

      {/* 4. Complétude & Éligibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section aria-label="Complétude documentaire">
          <CompletudeSection compliance={data.compliance} />
        </section>

        <section aria-label="Éligibilité réglementaire">
          <EligibiliteSection eligibility={data.eligibility} />
        </section>
      </div>
    </div>
  )
}