"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Position } from "@/hooks/usePositions"

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
    <div className="overflow-hidden">
      <div className="grid grid-cols-6 gap-2 px-6 py-4 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
        <div>Protocol</div>
        <div>Market</div>
        <div className="text-right">Collateral</div>
        <div className="text-right">Debt</div>
        <div className="text-right">Health</div>
        <div className="text-right">Action</div>
      </div>
      <div className="divide-y divide-border">
        {positions.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p>No Aave positions found for this wallet address.</p>
            <p className="text-sm mt-2">Connect a wallet with Aave positions to see them here.</p>
          </div>
        ) : (
          positions.map((p) => (
            <div key={p.id} className="grid grid-cols-6 gap-2 px-6 py-4 items-center text-sm hover:bg-muted/30 transition-colors">
              <div className="font-medium text-foreground">Aave</div>
              <div className="text-muted-foreground">{p.chain_name}</div>
              <div className="text-right font-medium">${p.total_collateral_usd.toLocaleString()}</div>
              <div className="text-right font-medium">${p.total_borrowed_usd.toLocaleString()}</div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  p.health_factor > 2 ? 'bg-green-100 text-green-800' :
                  p.health_factor > 1.5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {p.health_factor === 999 ? '∞' : p.health_factor.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <Link 
                  href={`/dashboard/position/${p.id}`} 
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
