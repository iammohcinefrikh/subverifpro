"use client"

import * as React from "react"
import { useLinkStatus } from "next/link"

type NavigationPendingContextValue = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
}

const NavigationPendingContext =
  React.createContext<NavigationPendingContextValue | null>(null)

/**
 * Tracks whether a client navigation is in flight so that route-level skeletons
 * can be shown for navigations that only change search params (which do not
 * re-trigger `loading.tsx`).
 */
export function NavigationPendingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [pending, setPending] = React.useState(false)

  const value = React.useMemo(() => ({ pending, setPending }), [pending])

  return (
    <NavigationPendingContext.Provider value={value}>
      {children}
    </NavigationPendingContext.Provider>
  )
}

export function useNavigationPending() {
  return React.useContext(NavigationPendingContext)?.pending ?? false
}

/**
 * Reports the pending state of its parent `<Link>` to the navigation context.
 * Must be rendered inside a `<Link>`.
 */
export function LinkPendingReporter() {
  const { pending } = useLinkStatus()
  const setPending = React.useContext(NavigationPendingContext)?.setPending

  React.useEffect(() => {
    if (!setPending || !pending) return
    setPending(true)
    return () => setPending(false)
  }, [setPending, pending])

  return null
}

/**
 * Renders `fallback` while a navigation is pending, otherwise renders `children`.
 * Lets a client-driven skeleton stand in for the route `loading.tsx`, which is
 * not re-shown for search-param-only navigations within the same segment.
 */
export function NavigationPendingShell({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) {
  const pending = useNavigationPending()
  return pending ? fallback : children
}
