"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HealthRing } from "@/components/health-ring"
import { PositionsTable } from "@/components/positions-table"
import { DemoBanner } from "@/providers/demo-mode"
import { Skeleton } from "@/components/ui/skeleton"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { motion } from "framer-motion"
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  Brain, 
  Zap, 
  RefreshCw,
  Eye,
  AlertTriangle
} from "lucide-react"

const fetcher = (url: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Only add Authorization header if we're on client side and have a token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return fetch(url, { headers }).then((r) => r.json());
}

function DashboardContent() {
  const { data, error, isLoading, mutate } = useSWR("/api/v1/positions/", fetcher)

  if (error) return <div className="p-6">Failed to load positions.</div>

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 neural-network opacity-5"></div>
      <div className="absolute top-20 left-10 w-1 h-1 bg-primary rounded-full pulse-cyan"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent rounded-full pulse-cyan" style={{animationDelay: '1s'}}></div>
      
      <div className="px-6 md:px-10 relative z-10">
        <DemoBanner />
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl py-8 md:py-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Guardian Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time monitoring and AI-powered risk analysis
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => mutate()}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <section className="mx-auto max-w-7xl pb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Portfolio Health Card */}
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
                    Portfolio Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-[200px] rounded-full" />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <HealthRing healthFactor={data?.average_health_factor ?? 1.5} size={200} />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">AI Risk Assessment</p>
                        <p className="text-xs text-primary">Neural Network Active</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Overview Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Activity className="w-5 h-5" />
                    Portfolio Overview
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-cyan"></div>
                    Live Data
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                  <AIStat 
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Net Value" 
                    value={`$${(data?.net_value_usd ?? 0).toLocaleString()}`}
                    gradient="from-green-500 to-emerald-600"
                  />
                  <AIStat 
                    icon={<Shield className="w-6 h-6" />}
                    label="Collateral" 
                    value={`$${(data?.total_collateral_usd ?? 0).toLocaleString()}`}
                    gradient="from-blue-500 to-cyan-600"
                  />
                  <AIStat 
                    icon={<AlertTriangle className="w-6 h-6" />}
                    label="Debt" 
                    value={`$${(data?.total_borrowed_usd ?? 0).toLocaleString()}`}
                    gradient="from-orange-500 to-red-600"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Positions Table */}
        <section className="mx-auto max-w-7xl pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-card border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Eye className="w-5 h-5" />
                  Monitored Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PositionsTable isLoading={isLoading} positions={data?.positions ?? []} />
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function AIStat({ 
  icon, 
  label, 
  value, 
  gradient 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <div className="rounded-lg border border-primary/20 bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full bg-gradient-to-r ${gradient}`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="text-muted-foreground text-sm font-medium">{label}</div>
        </div>
        <div className="text-2xl font-bold text-primary">{value}</div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
