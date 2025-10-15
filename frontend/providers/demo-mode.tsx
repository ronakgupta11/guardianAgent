"use client"

import type React from "react"

import { createContext, useContext, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

type Ctx = {
  demo: boolean
  toggleDemo: () => void
}
const DemoCtx = createContext<Ctx | null>(null)

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [demo, setDemo] = useState(true)
  const value = useMemo<Ctx>(() => ({ demo, toggleDemo: () => setDemo((d) => !d) }), [demo])

  return (
    <DemoCtx.Provider value={value}>
      <div className="relative">{children}</div>
    </DemoCtx.Provider>
  )
}

export function useDemoMode() {
  const ctx = useContext(DemoCtx)
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider")
  return ctx
}

export function DemoBanner() {
  const { demo, toggleDemo } = useDemoMode()
  if (!demo) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl my-4 rounded-md border bg-accent/10 px-4 py-2 flex items-center justify-between"
    >
      <span className="text-sm">Demo Mode is enabled. Data and actions are simulated.</span>
      <Button size="sm" variant="outline" onClick={toggleDemo}>
        Disable
      </Button>
    </div>
  )
}
