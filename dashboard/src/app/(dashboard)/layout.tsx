import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavigationPendingProvider } from "@/components/navigation-pending"
import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-breadcrumbs"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

/** Static stand-in shown while the client breadcrumb reads the URL. */
function BreadcrumbFallback() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-semibold text-stone-900 dark:text-stone-100">SubVerif Pro</span>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <NavigationPendingProvider>
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="flex flex-col min-h-screen bg-stone-50/30 dark:bg-stone-950">
          <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-background/95 backdrop-blur px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 size-7 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100" />
              <Separator orientation="vertical" className="mr-2 h-4 self-center!" />
              <Suspense fallback={<BreadcrumbFallback />}>
                <DashboardBreadcrumbs />
              </Suspense>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </SidebarInset>
      </NavigationPendingProvider>
    </SidebarProvider>
  )
}
