"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HealthRing } from "@/components/health-ring"
import { motion } from "framer-motion"
import { Login } from "@/components/Login"
import { useJwtContext } from "@lit-protocol/vincent-app-sdk/react"
import { useEffect } from 'react';
import { useAccount } from 'wagmi'; // any wallet lib works
import { BridgeButton, useNexus } from '@avail-project/nexus-widgets';

export default function HomePage() {
  const { authInfo } = useJwtContext();
  


  const { connector, isConnected } = useAccount();
  const { setProvider } = useNexus();

  useEffect(() => {
    if (isConnected && connector?.getProvider) {
      connector.getProvider().then((provider: any) => setProvider(provider));
    }
  }, [isConnected, connector, setProvider]);

  if (!authInfo) {
    return <Login />
  }

  return (
    <div className="px-6 md:px-10">
      <section className="mx-auto max-w-6xl py-12 md:py-16">
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Real-time risk insights • AI-assisted recovery • Demo-ready
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold text-balance">
              GuardianAgent: Monitor, Simulate, and Recover DeFi Positions
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Stay ahead of liquidation risk. Simulate market moves, get AI-crafted recovery plans, and mock-execute
              with transparent traceability—demo-ready.
            </p>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>

              <Button asChild variant="secondary">
                <Link href="/ai">Open AI Chat</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
          <Card className="bg-card">
            <CardContent className="p-8 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center gap-4"
              >
                <HealthRing healthFactor={1.42} size={180} />
                <p className="text-sm text-muted-foreground">Live Health Factor (demo)</p>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl py-10">
        <div className="grid md:grid-cols-3 gap-6">
        <BridgeButton prefill={{ chainId: 137, token: 'USDC', amount: '100' }}>
  {({ onClick, isLoading }) => (
    <button onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Bridging…' : 'Bridge 100 USDC → Polygon'}
    </button>
  )}
</BridgeButton>
          <Feature
            title="Monitor Risk"
            desc="Connect a wallet or use demo mode to view tracked positions and risk scores."
          />
          <Feature
            title="Simulate Stress"
            desc="Apply price shocks via a slider and preview updated health factors in real-time."
          />
          <Feature
            title="AI Recovery"
            desc="Review an AI-generated plan with a MeTTa-style trace before mock-executing."
          />
          <Feature
            title="Transparent Steps"
            desc="Execution stepper shows bridging, depositing, and completion states clearly."
          />
          <Feature
            title="Non-Custodial"
            desc="You control consent. Mock flows mimic real approvals without moving funds."
          />
          <Feature
            title="Built for Demos"
            desc="Simple, fast, and responsive—ideal for presentations and sponsor integrations."
          />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <Step n={1} title="Connect" desc="Link your wallet or enable demo mode to load example positions." />
          <Step
            n={2}
            title="Simulate"
            desc="Drag the slider to apply a market move and preview risk changes instantly."
          />
          <Step
            n={3}
            title="Recover"
            desc="Open the AI plan, review the MeTTa trace, and mock execute with full visibility."
          />
        </div>
      </section>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  )
}


function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-start gap-4">
        <div
          aria-hidden
          className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-semibold"
        >
          {n}
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
        </div>
      </CardContent>
    </Card>
  )
}
