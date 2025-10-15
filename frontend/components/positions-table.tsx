"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Position } from "@/lib/types"

export function PositionsTable({ positions, isLoading }: { positions: Position[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card className="p-4 grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-6 gap-2 px-4 py-3 text-xs text-muted-foreground">
        <div>Protocol</div>
        <div>Market</div>
        <div className="text-right">Collateral</div>
        <div className="text-right">Debt</div>
        <div className="text-right">Health</div>
        <div className="text-right">Action</div>
      </div>
      <div className="divide-y">
        {positions.map((p) => (
          <div key={p.id} className="grid grid-cols-6 gap-2 px-4 py-3 items-center text-sm">
            <div className="font-medium">{p.protocol}</div>
            <div>{p.market}</div>
            <div className="text-right">${p.collateralUSD.toLocaleString()}</div>
            <div className="text-right">${p.debtUSD.toLocaleString()}</div>
            <div className="text-right">{p.healthFactor.toFixed(2)}</div>
            <div className="text-right">
              <Link href={`/dashboard/position/${p.id}`} className="text-primary hover:underline">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
