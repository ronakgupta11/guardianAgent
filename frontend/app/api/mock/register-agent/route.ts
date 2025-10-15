import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { address } = await req.json()
  return NextResponse.json({
    ok: true,
    agentId: "agent-demo-1",
    address: address ?? "0xDemo",
  })
}
