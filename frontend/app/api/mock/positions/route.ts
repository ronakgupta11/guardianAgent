import { NextResponse } from "next/server"

export async function GET() {
  // Two sample positions
  const positions = [
    {
      id: 1,
      protocol: "Aave",
      market: "ETH/USDC",
      collateralUSD: 12000,
      debtUSD: 6000,
      ltv: 0.5,
      healthFactor: 1.6,
      sparkline: [1, 0.99, 1.01, 0.98, 1.02, 1.0, 0.99],
    },
    {
      id: 2,
      protocol: "Compound",
      market: "WETH/USDC",
      collateralUSD: 8000,
      debtUSD: 5200,
      ltv: 0.65,
      healthFactor: 1.23,
      sparkline: [1, 0.97, 0.98, 0.99, 0.97, 0.96, 0.95],
    },
  ]

  const totals = positions.reduce(
    (acc, p) => {
      acc.collateral += p.collateralUSD
      acc.debt += p.debtUSD
      return acc
    },
    { collateral: 0, debt: 0 },
  )
  const netValue = totals.collateral - totals.debt
  // naive weighted HF
  const healthFactor =
    positions.reduce((acc, p) => acc + p.healthFactor * p.collateralUSD, 0) /
    (positions.reduce((acc, p) => acc + p.collateralUSD, 0) || 1)

  return NextResponse.json({
    totals: { collateral: totals.collateral, debt: totals.debt, netValue, healthFactor },
    positions,
  })
}
