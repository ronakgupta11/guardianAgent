"use client"

import { useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { SimulationResponse } from "@/lib/types"

export function SimulationSlider({
  positionId,
  onSimulated,
  defaultPercent = 0,
}: {
  positionId: string
  onSimulated: (resp: SimulationResponse) => void
  defaultPercent?: number
}) {
  const [val, setVal] = useState<number[]>([defaultPercent])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedSimulate = (percent: number) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const res = await fetch("/api/mock/simulate", {
        method: "POST",
        body: JSON.stringify({ positionId, priceMultiplier: 1 - percent / 100 }),
      })
      const json = await res.json()
      onSimulated(json)
    }, 250)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="simSlider">Price Drop</Label>
        <span className="text-sm text-muted-foreground" id="simSlider">
          {val[0]}%
        </span>
      </div>
      <Slider
        defaultValue={val}
        value={val}
        min={0}
        max={50}
        step={1}
        onValueChange={(v) => {
          setVal(v)
          debouncedSimulate(v[0])
        }}
      />
    </div>
  )
}
