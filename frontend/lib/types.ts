export type Position = {
  id: string | number
  protocol: string
  market: string
  collateralUSD: number
  debtUSD: number
  ltv: number // 0..1
  healthFactor: number
  sparkline?: number[]
}

export type SimulationResponse = {
  positionId: string
  newHF: number
  projectedCollateral: number
  projectedDebt: number
  recommendedPlan: {
    id: string
    title: string
  }
}

export type ExecuteResponse = {
  txHash: string
  startTime: number
  endTime: number
  status: "success" | "failed"
}
