"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "cn"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronDownIcon, Tick02Icon } from "@hugeicons/core-free-icons"

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectPortal(props: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group/select flex h-8 w-fit min-w-0 cursor-default items-center justify-between gap-2 whitespace-nowrap rounded-md border border-stone-300 dark:border-stone-700 bg-background px-2.5 text-xs font-normal text-stone-800 outline-none transition-colors select-none dark:text-stone-200",
        "hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-50",
        "data-popup-open:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        className
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ChevronDownIcon}
        size={14}
        strokeWidth={2}
        className="shrink-0 text-muted-foreground transition-transform duration-100 group-data-popup-open/select:rotate-180"
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> & {
  align?: React.ComponentProps<typeof SelectPrimitive.Positioner>["align"]
  alignOffset?: number
  side?: React.ComponentProps<typeof SelectPrimitive.Positioner>["side"]
  sideOffset?: number
}) {
  return (
    <SelectPortal>
      <SelectPrimitive.Positioner
        data-slot="select-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative z-50 max-h-(--available-height) min-w-44 w-(--anchor-width) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            "origin-(--transform-origin) duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPortal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <span className="pointer-events-none absolute right-2 flex items-center justify-center text-foreground">
        <SelectPrimitive.ItemIndicator>
          <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

export {
  Select,
  SelectGroup,
  SelectPortal,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
