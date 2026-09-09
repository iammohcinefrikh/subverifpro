"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { signOut, useSession } from "@/lib/auth-client"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileValidationIcon,
  DashboardSquare01Icon,
  Folder01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

const dossierTypes = [
  { key: "", label: "Tous les dossiers" },
  { key: "a-verifier", label: "À vérifier" },
  { key: "complets", label: "Complets" },
  { key: "incomplets", label: "Incomplets" },
  { key: "en-attente", label: "En attente de complément" },
  { key: "urgents", label: "Urgents" },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = useSession()

  const typeParam = searchParams.get("type")
  const isDossiersPage = pathname === "/dashboard/dossiers"

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
      <SidebarHeader className="">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-2.5 rounded-lg"
              render={(props) => <Link {...props} href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-sm">
                <HugeiconsIcon icon={FileValidationIcon} size={18} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  SubVerif Pro
                </span>
                <span className="truncate text-[10px] font-medium text-muted-foreground">
                  Pré-contrôle & éligibilité
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
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
                    <Link {...props} href="/dashboard/dossiers">
                      <HugeiconsIcon icon={Folder01Icon} size={16} strokeWidth={2} />
                      <span>Dossiers</span>
                    </Link>
                  )}
                />
                <SidebarMenuSub>
                  {dossierTypes.map((item) => {
                    const isActive =
                      item.key === ""
                        ? isDossiersPage && !typeParam
                        : isDossiersPage && typeParam === item.key
                    return (
                      <SidebarMenuSubItem key={item.key || "all"}>
                        <SidebarMenuSubButton
                          isActive={isActive}
                          render={(props) => (
                            <Link
                              {...props}
                              href={`/dashboard/dossiers${item.key ? `?type=${item.key}` : ""}`}
                            />
                          )}
                        >
                          {item.label}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-stone-200 dark:border-stone-800 p-2.5">
        <div className="flex items-center justify-between gap-2">
          {isPending ? (
            <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
              <Skeleton className="size-7 shrink-0 rounded-full bg-stone-200/80 dark:bg-stone-800" />
              <div className="flex flex-col gap-1.5 min-w-0 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-3 w-24 rounded bg-stone-200/80 dark:bg-stone-800" />
                <Skeleton className="h-2.5 w-32 rounded bg-stone-200/60 dark:bg-stone-800" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:flex-1">
              <Avatar className="size-7">
                <AvatarFallback className="text-[11px] font-semibold bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {userEmail}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-0.5 shrink-0 group-data-[collapsible=icon]:hidden">
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
