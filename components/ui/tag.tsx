import type React from "react"
import { cn } from "@/lib/utils"

interface TagProps {
  children: React.ReactNode
  variant?: "default" | "other" | "g1" | "g2" | "g3"
  className?: string
}

export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-sans",
        variant === "default" && "bg-blue-600 text-white border border-blue-700",
        variant === "g1" && "bg-blue-600 text-white border border-blue-700",
        variant === "g2" && "bg-[#8B5E3C] text-white border border-[#78523C]",
        variant === "g3" && "bg-[#DB6B5E] text-white border border-[#C85A4E]",
        variant === "other" && "bg-gray-600 text-white border border-gray-700",
        className,
      )}
    >
      {children}
    </span>
  )
}
