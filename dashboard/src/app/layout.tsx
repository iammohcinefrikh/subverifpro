import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: {
    template: "%s | SubVerif Pro",
    default: "SubVerif Pro — Tableau de bord d'instruction & audit",
  },
  description: "Plateforme d'instruction, audit opérationnel et conformité des dossiers de subvention",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-stone-200 dark:selection:bg-stone-800">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={150}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
