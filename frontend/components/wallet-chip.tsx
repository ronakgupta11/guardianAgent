"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export function WalletChip() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connectDemo = () => {
    setConnected(true)
    setAddress("0xDemo...1234")
  }

  const disconnect = () => {
    setConnected(false)
    setAddress(null)
  }

  if (!connected) {
    return (
      <Button variant="secondary" onClick={connectDemo}>
        Connect Demo Wallet
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full border px-3 py-1">
      <span className="text-xs font-mono">{address}</span>
      <Button variant="ghost" size="sm" onClick={disconnect}>
        Disconnect
      </Button>
    </div>
  )
}
