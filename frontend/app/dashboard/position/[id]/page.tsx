"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HealthRing } from "@/components/health-ring"
import { SimulationSlider } from "@/components/simulation-slider"
import { AIPlanModal } from "@/components/ai-plan-modal"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Shield, 
  TrendingUp, 
  Brain, 
  Zap,
  Activity
} from "lucide-react"
import Link from "next/link"
import type { Position } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PositionDetailPage() {
  const params = useParams<{ id: string }>()
  const { data } = useSWR("/api/mock/positions", fetcher)
  const position: Position | undefined = useMemo(
    () => data?.positions?.find((p: Position) => String(p.id) === String(params.id)),
    [data, params.id],
  )

  const [simHF, setSimHF] = useState<number | null>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const hf = simHF ?? position?.healthFactor ?? 1.5

  const spark = useMemo(
    () => (position?.sparkline ?? [1, 0.98, 1.02, 0.97, 1.01, 0.99, 1]).map((v, i) => ({ x: i, y: v })),
    [position],
  )

  if (!position) return <div className="p-6">Loading position…</div>

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 neural-network opacity-5"></div>
      <div className="absolute top-20 left-10 w-1 h-1 bg-primary rounded-full pulse-cyan"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent rounded-full pulse-cyan" style={{animationDelay: '1s'}}></div>
      
      <div className="px-6 md:px-10 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl py-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Position Management
              </h1>
              <p className="text-muted-foreground mt-2">
                {position.protocol} — {position.market} • AI-powered risk analysis
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">LTV</div>
              <div className="text-2xl font-bold text-primary">{Math.round(position.ltv * 100)}%</div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Health Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Shield className="w-5 h-5" />
                    Health Factor
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <HealthRing healthFactor={hf} size={200} />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">AI Risk Assessment</p>
                      <p className="text-xs text-primary">Neural Network Active</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    Performance History
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-cyan"></div>
                    Live Data
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spark}>
                        <Line 
                          type="monotone" 
                          dataKey="y" 
                          stroke="var(--color-primary)" 
                          strokeWidth={3} 
                          dot={false}
                          activeDot={{ r: 4, fill: "var(--color-primary)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Simulation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  AI Risk Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <SimulationSlider
                  positionId={String(position.id)}
                  onSimulated={(v) => setSimHF(v.newHF)}
                  defaultPercent={0}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Collateral: <strong>${position.collateralUSD.toLocaleString()}</strong></span>
                      <span>Debt: <strong>${position.debtUSD.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <Button 
                    className="web3-gradient text-primary-foreground"
                    onClick={() => setPlanOpen(true)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate AI Recovery Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AIPlanModal
          open={planOpen}
          onOpenChange={setPlanOpen}
          position={position}
          onSuccess={() => {
            // Optionally trigger a refetch upstream if needed
          }}
        />
      </div>
    </div>
  )
}
