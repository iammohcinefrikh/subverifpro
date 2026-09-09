import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-stone-50/30 dark:bg-stone-950">
        <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-background/95 backdrop-blur px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 size-7 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100" />
            <Separator orientation="vertical" className="mr-2 h-4 self-center!" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                SubVerif Pro
              </span>
              <span>/</span>
              <span className="text-stone-600 dark:text-stone-300">Tableau de bord</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Système opérationnel</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
