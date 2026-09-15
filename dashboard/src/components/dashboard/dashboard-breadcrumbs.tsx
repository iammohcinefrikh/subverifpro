"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ALL_DOSSIERS_HREF,
  ALL_DOSSIERS_LABEL,
  DASHBOARD_HREF,
  DOSSIER_TYPE_LABELS,
  dossiersTypeHref,
  isDossierType,
} from "@/lib/dossier-nav"
import { STATS_LABEL } from "@/lib/nav"

const BRAND_LABEL = "SubVerif Pro"

interface Crumb {
  label: string
  /** When absent, the crumb is the current page and rendered as plain text. */
  href?: string
}

/**
 * Builds the breadcrumb trail from the current URL. The dossier detail page
 * uses the `from` search param to restore the exact list the user navigated
 * from, so the category crumb links back to it.
 */
function buildCrumbs(pathname: string, searchParams: URLSearchParams): Crumb[] {
  const segments = pathname.split("/").filter(Boolean)

  // The dashboard layout only wraps /dashboard/*; anything else is unexpected.
  if (segments[0] !== "dashboard") return [{ label: "Vue d'ensemble" }]

  const section = segments[1]

  if (!section) return [{ label: "Vue d'ensemble" }]

  if (section === "dossiers") {
    const dossierId = segments[2]

    // Dossiers list: optionally filtered by type.
    if (!dossierId) {
      const type = searchParams.get("type")
      if (isDossierType(type)) {
        return [
          { label: ALL_DOSSIERS_LABEL, href: ALL_DOSSIERS_HREF },
          { label: DOSSIER_TYPE_LABELS[type] },
        ]
      }
      return [{ label: ALL_DOSSIERS_LABEL }]
    }

    // Dossier detail: parent depends on where the user came from.
    const from = searchParams.get("from")
    const crumbs: Crumb[] = []

    if (from === "dashboard") {
      crumbs.push({ label: "Vue d'ensemble", href: DASHBOARD_HREF })
    } else {
      crumbs.push({ label: ALL_DOSSIERS_LABEL, href: ALL_DOSSIERS_HREF })
      if (isDossierType(from)) {
        crumbs.push({ label: DOSSIER_TYPE_LABELS[from], href: dossiersTypeHref(from) })
      }
    }

    crumbs.push({ label: `APP-${dossierId.slice(0, 6).toUpperCase()}` })
    return crumbs
  }

  if (section === "statistiques") return [{ label: STATS_LABEL }]

  return [{ label: section }]
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const crumbs = buildCrumbs(pathname, searchParams)

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink
            className="font-semibold text-stone-900 dark:text-stone-100"
            render={(props) => <Link {...props} href={DASHBOARD_HREF} />}
          >
            {BRAND_LABEL}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb.label}-${index}`}>
            <BreadcrumbSeparator className="text-stone-400 dark:text-stone-600">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink
                  render={(props) => <Link {...props} href={crumb.href!} />}
                >
                  {crumb.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-stone-600 dark:text-stone-300">
                  {crumb.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}