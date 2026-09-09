import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDossierDetail } from "@/lib/queries/dossier"
import { DossierHeader } from "@/components/dossier/dossier-header"
import { DemandeurInfo } from "@/components/dossier/demandeur-info"
import { CompletudeSection } from "@/components/dossier/completude-section"
import { EligibiliteSection } from "@/components/dossier/eligibilite-section"
import { ComplementsSection } from "@/components/dossier/complements-section"
import { AiSynthesis } from "@/components/dossier/ai-synthesis"
import { HistoriqueSection } from "@/components/dossier/historique-section"

interface PageProps {
  params: Promise<{ id: string }>
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

export default async function DossierDetailPage({ params }: PageProps) {
  const { id } = await params
  const data = await getDossierDetail(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sticky Navigation & Status Header */}
      <DossierHeader data={data} />

      {/* 2. Informations du demandeur & Projet */}
      <section aria-label="Informations du demandeur">
        <DemandeurInfo application={data.application} />
      </section>

      {/* 3. Complétude & Éligibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Complétude documentaire">
          <CompletudeSection compliance={data.compliance} />
        </section>

        <section aria-label="Éligibilité réglementaire">
          <EligibiliteSection eligibility={data.eligibility} />
        </section>
      </div>

      {/* 4. Compléments & Synthèse IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Demandes de compléments">
          <ComplementsSection complements={data.complements} />
        </section>

        <section aria-label="Synthèse de l'intelligence artificielle">
          <AiSynthesis aiAnalysis={data.aiAnalysis} />
        </section>
      </div>

      {/* 5. Historique opérationnel */}
      <section aria-label="Historique du dossier">
        <HistoriqueSection history={data.history} />
      </section>
    </div>
  )
}
