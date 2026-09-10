import { Metadata } from "next"
import { getDashboardData } from "@/lib/queries/dashboard"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { StatusChart } from "@/components/dashboard/status-chart"
import { CompletenessChart } from "@/components/dashboard/completeness-chart"
import { EligibilityChart } from "@/components/dashboard/eligibility-chart"
import { DeadlinesList } from "@/components/dashboard/deadlines-list"
import { PriorityDossiers } from "@/components/dashboard/priority-dossiers"

export const metadata: Metadata = {
  title: "Vue d'ensemble",
  description: "Situation opérationnelle globale et dossiers prioritaires à traiter",
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Top Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Vue d&apos;ensemble opérationnelle
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suivi en temps réel des demandes, conformité documentaire et dossiers prioritaires à instruire.
          </p>
        </div>
      </div>

      {/* Top: 6 KPIs */}
      <section aria-label="Indicateurs clés">
        <KpiCards kpis={data.kpis} />
      </section>

      {/* Middle: Overall Situation (4 Columns / Cards) */}
      <section aria-label="Situation globale" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusChart data={data.statusDistribution} total={data.kpis.totalApplications} />
        <CompletenessChart data={data.completenessDistribution} />
        <EligibilityChart data={data.eligibilityDistribution} />
        <DeadlinesList deadlines={data.upcomingDeadlines} />
      </section>

      {/* Bottom: "À instruire en priorité" Prioritized List */}
      <PriorityDossiers dossiers={data.dossiersATraiter} />
    </div>
  )
}
