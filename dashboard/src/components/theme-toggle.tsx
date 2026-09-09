"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className="w-8 h-8 rounded-md text-muted-foreground">
        <span className="sr-only">Changer de thème</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {theme === "dark" ? (
        <HugeiconsIcon icon={Sun02Icon} size={16} strokeWidth={2} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={2} />
      )}
      <span className="sr-only">Changer de thème</span>
    </Button>
  )
}
