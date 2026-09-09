"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileValidationIcon,
  DashboardSquare01Icon,
  Folder01Icon,
  Activity01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
      router.refresh()
    } catch {
      router.push("/login")
    }
  }

  const user = session?.user
  const userName = user?.name || "Instructeur"
  const userEmail = user?.email || "instructeur@subverif.pro"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "IN"

  return (
    <Sidebar collapsible="icon" className="border-r border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
      <SidebarHeader className="border-b border-stone-200 dark:border-stone-800 p-3">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-sm transition-transform group-hover:scale-105">
              <HugeiconsIcon icon={FileValidationIcon} size={18} strokeWidth={2} />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-semibold text-sm tracking-tight text-stone-900 dark:text-stone-100 truncate">
                SubVerif Pro
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                Instruction & Audit
              </span>
            </div>
          </Link>
          <Badge variant="outline" className="hidden xl:inline-flex text-[10px] font-medium border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-1.5 py-0 h-4">
            v1.0
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase font-semibold text-stone-500 dark:text-stone-400 px-2 tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/dashboard"}
                  className="rounded-md h-8 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 data-active:bg-stone-900 data-active:text-stone-50 dark:data-active:bg-stone-100 dark:data-active:text-stone-900 transition-colors"
                  render={(props) => (
                    <Link {...props} href="/dashboard">
                      <HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={2} />
                      <span>Vue d&apos;ensemble</span>
                    </Link>
                  )}
                />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/dashboard/dossiers")}
                  className="rounded-md h-8 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 data-active:bg-stone-900 data-active:text-stone-50 dark:data-active:bg-stone-100 dark:data-active:text-stone-900 transition-colors"
                  render={(props) => (
                    <Link {...props} href="/dashboard#dossiers-table">
                      <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
                      <span>Dossiers à traiter</span>
                    </Link>
                  )}
                />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/uptime"}
                  className="rounded-md h-8 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  render={(props) => (
                    <Link {...props} href="/uptime" target="_blank" rel="noopener noreferrer">
                      <HugeiconsIcon icon={Activity01Icon} size={16} strokeWidth={2} />
                      <span className="flex-1">Santé Système</span>
                      <span className="size-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse" />
                    </Link>
                  )}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-stone-200 dark:border-stone-800 p-2.5">
        <div className="flex items-center justify-between gap-2 p-1">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-7 rounded-md border border-stone-200 dark:border-stone-800">
              <AvatarFallback className="text-[11px] font-semibold bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">
                {userName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="size-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Se déconnecter"
            >
              <HugeiconsIcon icon={Logout01Icon} size={15} strokeWidth={2} />
              <span className="sr-only">Déconnexion</span>
            </Button>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
