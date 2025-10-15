"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthRing } from "@/components/health-ring"
import { PositionsTable } from "@/components/positions-table"
import { DemoBanner } from "@/providers/demo-mode"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/mock/positions", fetcher)

  if (error) return <div className="p-6">Failed to load positions.</div>

  return (
    <div className="px-6 md:px-10">
      <DemoBanner />
      <section className="mx-auto max-w-6xl py-8 md:py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-balance">Portfolio Health</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
              {isLoading ? (
                <Skeleton className="h-[180px] w-[180px] rounded-full" />
              ) : (
                <HealthRing healthFactor={data?.totals?.healthFactor ?? 1.5} size={180} />
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Overview</CardTitle>
              <Button variant="outline" onClick={() => mutate()}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 p-6">
              <Stat label="Net Value" value={`$${(data?.totals?.netValue ?? 0).toLocaleString()}`} />
              <Stat label="Collateral" value={`$${(data?.totals?.collateral ?? 0).toLocaleString()}`} />
              <Stat label="Debt" value={`$${(data?.totals?.debt ?? 0).toLocaleString()}`} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl pb-12">
        <PositionsTable isLoading={isLoading} positions={data?.positions ?? []} />
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}
