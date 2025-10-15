"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletChip } from "@/components/wallet-chip"
import { useDemoMode } from "@/providers/demo-mode"

export function Header() {
  const { demo, toggleDemo } = useDemoMode()
  return (
    <header className="border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          GuardianAgent
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/ai" className="text-sm text-muted-foreground hover:text-foreground">
            AI Chat
          </Link>
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
            Profile
          </Link>
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant={demo ? "default" : "outline"} onClick={toggleDemo} aria-pressed={demo}>
            {demo ? "Demo On" : "Demo Off"}
          </Button>
          <WalletChip />
        </div>
      </div>
    </header>
  )
}
