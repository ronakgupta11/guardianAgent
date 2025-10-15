import { type NextRequest, NextResponse } from "next/server"

// Simple simulation: priceMultiplier < 1 reduces collateral; HF = (collateral * (1 - ltv)) / debt scaled
export async function POST(req: NextRequest) {
  const { positionId, priceMultiplier = 1 } = await req.json()
  // Baseline data (could look up by id; simplified)
  const base = {
    1: { collateralUSD: 12000, debtUSD: 6000, ltv: 0.5, baseHF: 1.6 },
    2: { collateralUSD: 8000, debtUSD: 5200, ltv: 0.65, baseHF: 1.23 },
  } as const

  const p = base[Number(positionId) as 1 | 2] ?? base[1]
  const projectedCollateral = Math.max(0, p.collateralUSD * priceMultiplier)
  const projectedDebt = p.debtUSD // keep debt flat for this demo
  const cushion = 1 - p.ltv // safety cushion
  const newHF = Math.max(0.1, (projectedCollateral * cushion) / (projectedDebt / p.baseHF))

  return NextResponse.json({
    positionId: String(positionId),
    newHF: Number(newHF.toFixed(2)),
    projectedCollateral: Math.round(projectedCollateral),
    projectedDebt,
    recommendedPlan: { id: "plan-demo", title: "Add collateral and partial repay" },
  })
}
