"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MeTTaTrace } from "@/components/metta-trace"
import { TransactionStepper } from "@/components/transaction-stepper"
import type { Position, ExecuteResponse } from "@/lib/types"

export function AIPlanModal({
  open,
  onOpenChange,
  position,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  position: Position
  onSuccess?: () => void
}) {
  const { toast } = useToast()
  const [executing, setExecuting] = React.useState(false)
  const [done, setDone] = React.useState<ExecuteResponse | null>(null)

  const mockPlan = {
    id: "plan-demo",
    title: "Reduce LTV by adding collateral and partial repay",
    steps: ["Bridge 500 USDC to Base", "Swap USDC -> WETH", "Deposit WETH as collateral", "Repay 200 USDC debt"],
  }

  const runExecute = async () => {
    setExecuting(true)
    const res = await fetch("/api/mock/execute", {
      method: "POST",
      body: JSON.stringify({ planId: mockPlan.id, permissionToken: "demo" }),
    })
    const json: ExecuteResponse = await res.json()
    setDone(json)
    setExecuting(false)
    toast({ title: "Execution complete", description: "Positions updated (mock)." })
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="plan-desc" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Recovery Plan</DialogTitle>
          <DialogDescription id="plan-desc">
            A transparent, step-by-step plan (demo) to improve your health factor on {position.protocol}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{mockPlan.title}</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2">
              {mockPlan.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <MeTTaTrace
            items={[
              { label: "Goal", value: "Improve HF to >= 1.5" },
              { label: "Context", value: `${position.market} on ${position.protocol}` },
              { label: "Strategy", value: "Add collateral + partial repay" },
              { label: "Risks", value: "Volatility, slippage, gas costs" },
            ]}
          />

          {executing ? (
            <TransactionStepper />
          ) : done ? (
            <div className="text-sm">
              <div className="font-medium">Status: {done.status}</div>
              <div className="text-muted-foreground mt-1">Tx Hash: {done.txHash}</div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button className="bg-primary text-primary-foreground" onClick={runExecute}>
                Execute Plan (Mock)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
