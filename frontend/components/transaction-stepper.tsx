"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const steps = ["Preparing", "Signing", "Bridging", "Depositing", "Done"]

export function TransactionStepper() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => Math.min(a + 1, steps.length - 1))
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid gap-3">
      {steps.map((s, i) => (
        <div key={s} className={cn("flex items-center gap-3 text-sm", i <= active ? "opacity-100" : "opacity-50")}>
          <span
            aria-hidden
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              i < active ? "bg-primary" : i === active ? "bg-accent" : "bg-muted",
            )}
          />
          <span>{s}</span>
        </div>
      ))}
    </div>
  )
}
