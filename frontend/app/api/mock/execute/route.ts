import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { planId } = await req.json()
  // simulate latency
  await new Promise((r) => setTimeout(r, 1200))
  const now = Date.now()
  return NextResponse.json({
    txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
    startTime: now - 1200,
    endTime: now,
    status: planId ? "success" : "failed",
  })
}
