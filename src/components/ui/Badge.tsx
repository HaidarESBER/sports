"use client"

import { HTMLAttributes } from "react"

export const sportColors: Record<string, { bg: string; text: string }> = {
  running: { bg: "bg-green-100", text: "text-green-800" },
  swimming: { bg: "bg-blue-100", text: "text-blue-800" },
  cycling: { bg: "bg-yellow-100", text: "text-yellow-800" },
  strength: { bg: "bg-red-100", text: "text-red-800" },
  other: { bg: "bg-gray-100", text: "text-gray-800" },
}

export const sportLabels: Record<string, string> = {
  running: "Course",
  swimming: "Natation",
  cycling: "Cyclisme",
  strength: "Musculation",
  other: "Autre",
}

type BadgeVariant = "sport" | "default" | "success" | "warning" | "danger" | "info"
type BadgeSize = "sm" | "md" | "lg"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  sport?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  sport: "", // Will be overridden by sport prop
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
}

export function Badge({
  variant = "default",
  size = "md",
  sport,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const sportColor = sport ? sportColors[sport] || sportColors.other : null
  const sportLabel = sport ? sportLabels[sport] || sport : null

  const baseClasses = `
    inline-flex items-center rounded-full font-medium
    ${sizeStyles[size]}
    ${sportColor ? `${sportColor.bg} ${sportColor.text}` : variantStyles[variant]}
    ${className}
  `

  return (
    <span className={baseClasses} {...props}>
      {sportLabel || children}
    </span>
  )
}

