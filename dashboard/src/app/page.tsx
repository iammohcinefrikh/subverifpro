import Link from "next/link"
import { getDashboardData } from "@/lib/queries/dashboard"
import { getUptimeData } from "@/lib/queries/uptime"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileValidationIcon,
  DashboardSquare01Icon,
  Activity01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
  InboxIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [dashboardData, uptimeData] = await Promise.all([
    getDashboardData(),
    getUptimeData(),
  ])

  const latestDossier = dashboardData.dossiersATraiter[0]

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-background/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center shadow-xs">
              <HugeiconsIcon icon={FileValidationIcon} size={18} strokeWidth={2} />
            </div>
            <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">
              SubVerif Pro
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="h-8 text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900">
              <Link href="/dashboard">
                <span>Espace Instructeur</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Hero Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="text-[11px] font-mono border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-2 py-0.5">
            Tableau de bord d'instruction & d'audit
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Aperçu synthétique des opérations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Extrait en temps réel des indicateurs opérationnels, de la conformité des dossiers et de la santé du système.
          </p>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Snippet 1: Vue d'ensemble KPIs */}
          <Card className="border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DashboardSquare01Icon} size={16} className="text-stone-700 dark:text-stone-300" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Vue d'ensemble
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Opérations
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-md bg-stone-100/60 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[10px] text-muted-foreground block">Demandes</span>
                  <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100">
                    {dashboardData.kpis.totalApplications}
                  </span>
                </div>
                <div className="p-2 rounded-md bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block">Complets</span>
                  <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {dashboardData.kpis.completedDossiers}
                  </span>
                </div>
                <div className="p-2 rounded-md bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 block">À vérifier</span>
                  <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-400">
                    {dashboardData.kpis.toVerifyDossiers}
                  </span>
                </div>
                <div className="p-2 rounded-md bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                  <span className="text-[10px] text-rose-800 dark:text-rose-300 block">Urgents (&lt; 48h)</span>
                  <span className="text-base font-bold font-mono text-rose-700 dark:text-rose-400">
                    {dashboardData.kpis.urgentDossiers}
                  </span>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs border-stone-200 dark:border-stone-800">
                <Link href="/dashboard">
                  <span>Accéder à la vue complète</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Snippet 2: Dossier prioritaire */}
          <Card className="border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Folder01Icon} size={16} className="text-stone-700 dark:text-stone-300" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Dossier prioritaire
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                À traiter
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              {latestDossier ? (
                <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                      {latestDossier.reference}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {latestDossier.statusLabel}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-stone-900 dark:text-stone-100 block">
                      {latestDossier.applicantName}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {latestDossier.programName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800 text-[11px]">
                    <span className="text-muted-foreground">Complétude : {latestDossier.completenessRate}%</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      {latestDossier.deadlineFormatted}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucun dossier en attente de traitement
                </div>
              )}

              {latestDossier && (
                <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs border-stone-200 dark:border-stone-800">
                  <Link href={`/dashboard/dossiers/${latestDossier.applicationId}`}>
                    <span>Voir la fiche détaillée</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Snippet 3: Statut Système / Uptime */}
          <Card className="border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Activity01Icon} size={16} className="text-stone-700 dark:text-stone-300" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Santé du Système
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800">
                Opérationnel
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Disponibilité globale</span>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {uptimeData.overallUptimePct}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Latence moyenne pipeline</span>
                  <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
                    {uptimeData.avgPipelineDurationMs} ms
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Services surveillés</span>
                  <span className="font-mono text-stone-900 dark:text-stone-100">
                    {uptimeData.services.length} actifs
                  </span>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full h-7 text-xs border-stone-200 dark:border-stone-800">
                <Link href="/uptime">
                  <span>Consulter le statut public</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-4 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SubVerif Pro — Système d'audit & instruction des subventions</span>
          <span className="font-mono text-[11px]">v1.0 • Next.js 15.5.25</span>
        </div>
      </footer>
    </div>
  )
}
