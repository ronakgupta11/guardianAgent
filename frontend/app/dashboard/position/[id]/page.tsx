"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HealthRing } from "@/components/health-ring"
import { SimulationSlider } from "@/components/simulation-slider"
import { AIPlanModal } from "@/components/ai-plan-modal"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import type { Position } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PositionDetailPage() {
  const params = useParams<{ id: string }>()
  const { data } = useSWR("/api/mock/positions", fetcher)
  const position: Position | undefined = useMemo(
    () => data?.positions?.find((p: Position) => String(p.id) === String(params.id)),
    [data, params.id],
  )

  const [simHF, setSimHF] = useState<number | null>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const hf = simHF ?? position?.healthFactor ?? 1.5

  const spark = useMemo(
    () => (position?.sparkline ?? [1, 0.98, 1.02, 0.97, 1.01, 0.99, 1]).map((v, i) => ({ x: i, y: v })),
    [position],
  )

  if (!position) return <div className="p-6">Loading position…</div>

  return (
    <div className="px-6 md:px-10 mx-auto max-w-6xl py-8 space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Health</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <HealthRing healthFactor={hf} size={180} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              {position.protocol} — {position.market}
            </CardTitle>
            <div className="text-sm text-muted-foreground">LTV {Math.round(position.ltv * 100)}%</div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}>
                  <Line type="monotone" dataKey="y" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulate Price Drop</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <SimulationSlider
            positionId={String(position.id)}
            onSimulated={(v) => setSimHF(v.newHF)}
            defaultPercent={0}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Current Collateral: ${position.collateralUSD.toLocaleString()} • Debt: $
              {position.debtUSD.toLocaleString()}
            </div>
            <Button className="bg-primary text-primary-foreground" onClick={() => setPlanOpen(true)}>
              Simulate Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <AIPlanModal
        open={planOpen}
        onOpenChange={setPlanOpen}
        position={position}
        onSuccess={() => {
          // Optionally trigger a refetch upstream if needed
        }}
      />
    </div>
  )
}
