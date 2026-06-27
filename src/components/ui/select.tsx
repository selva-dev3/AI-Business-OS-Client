"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const SelectRoot = SelectPrimitive.Root as any
const SelectGroupPrimitive = SelectPrimitive.Group as any
const SelectValuePrimitive = SelectPrimitive.Value as any
const SelectTriggerPrimitive = SelectPrimitive.Trigger as any
const SelectContentPrimitive = SelectPrimitive.Content as any
const SelectPortalPrimitive = SelectPrimitive.Portal as any
const SelectViewportPrimitive = SelectPrimitive.Viewport as any
const SelectLabelPrimitive = SelectPrimitive.Label as any
const SelectItemPrimitive = SelectPrimitive.Item as any
const SelectItemIndicatorPrimitive = SelectPrimitive.ItemIndicator as any
const SelectItemTextPrimitive = SelectPrimitive.ItemText as any
const SelectSeparatorPrimitive = SelectPrimitive.Separator as any
const SelectScrollUpButtonPrimitive = SelectPrimitive.ScrollUpButton as any
const SelectScrollDownButtonPrimitive = SelectPrimitive.ScrollDownButton as any

export interface SelectProps {
  children?: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  dir?: "ltr" | "rtl"
  name?: string
  autoComplete?: string
  disabled?: boolean
  required?: boolean
}

export interface SelectGroupProps extends React.ComponentPropsWithoutRef<"div"> {}

export interface SelectValueProps {
  placeholder?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  size?: "sm" | "default"
}

export interface SelectContentProps {
  className?: string
  children?: React.ReactNode
  position?: "item-aligned" | "popper"
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  alignOffset?: number
}

export interface SelectLabelProps extends React.ComponentPropsWithoutRef<"div"> {}

export interface SelectItemProps {
  value: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<"div"> {}

const Select: React.FC<SelectProps> = ({ ...props }) => {
  return <SelectRoot data-slot="select" {...props} />
}

const SelectGroup: React.FC<SelectGroupProps> = ({ className, ...props }) => {
  return (
    <SelectGroupPrimitive
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

const SelectValue: React.FC<SelectValueProps> = ({ ...props }) => {
  return <SelectValuePrimitive data-slot="select-value" {...props} />
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({
  className,
  size = "default",
  children,
  ...props
}) => {
  return (
    <SelectTriggerPrimitive
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectTriggerPrimitive>
  )
}

const SelectContent: React.FC<SelectContentProps> = ({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}) => {
  return (
    <SelectPortalPrimitive>
      <SelectContentPrimitive
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position ==="popper"&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectViewportPrimitive
          data-position={position}
          className={cn(
            "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
            position === "popper" && ""
          )}
        >
          {children}
        </SelectViewportPrimitive>
        <SelectScrollDownButton />
      </SelectContentPrimitive>
    </SelectPortalPrimitive>
  )
}

const SelectLabel: React.FC<SelectLabelProps> = ({
  className,
  ...props
}) => {
  return (
    <SelectLabelPrimitive
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

const SelectItem: React.FC<SelectItemProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <SelectItemPrimitive
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectItemIndicatorPrimitive>
          <CheckIcon className="pointer-events-none" />
        </SelectItemIndicatorPrimitive>
      </span>
      <SelectItemTextPrimitive>{children}</SelectItemTextPrimitive>
    </SelectItemPrimitive>
  )
}

const SelectSeparator: React.FC<SelectSeparatorProps> = ({
  className,
  ...props
}) => {
  return (
    <SelectSeparatorPrimitive
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: any) {
  return (
    <SelectScrollUpButtonPrimitive
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectScrollUpButtonPrimitive>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: any) {
  return (
    <SelectScrollDownButtonPrimitive
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectScrollDownButtonPrimitive>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
