"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDemoMode } from "@/providers/demo-mode"
import { motion } from "framer-motion"
import { 
  Settings, 
  Brain, 
  Shield, 
  Bell, 
  BarChart3,
  Zap,
  Network,
  Eye,
  Lock
} from "lucide-react"

export default function SettingsPage() {
  const { demo, toggleDemo } = useDemoMode()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 neural-network opacity-10"></div>
      <div className="absolute top-20 left-10 w-1 h-1 bg-primary rounded-full pulse-cyan"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent rounded-full pulse-cyan" style={{animationDelay: '1s'}}></div>
      
      <div className="mx-auto max-w-4xl px-6 md:px-10 py-10 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="p-2 rounded-full bg-gradient-to-r from-primary to-accent"
            >
              <Settings className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Guardian Settings
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Configure your AI-powered DeFi guardian preferences and monitoring settings
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="demo-switch" className="text-primary font-medium">Demo Mode</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use simulated data and mock actions suitable for demos.
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="demo-switch" 
                    checked={demo} 
                    onCheckedChange={toggleDemo} 
                    aria-checked={demo}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-accent/20">
                      <Bell className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <Label htmlFor="notif-switch" className="text-primary font-medium">AI Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-1">Get alerts for risk analysis and recovery actions.</p>
                    </div>
                  </div>
                  <Switch 
                    id="notif-switch" 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="analytics-switch" className="text-primary font-medium">Anonymous Analytics</Label>
                      <p className="text-xs text-muted-foreground mt-1">Help improve AI models with privacy-friendly metrics.</p>
                    </div>
                  </div>
                  <Switch 
                    id="analytics-switch"
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Guardian Settings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  AI Guardian Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="monitoring-switch" className="text-primary font-medium">24/7 Monitoring</Label>
                      <p className="text-xs text-muted-foreground mt-1">Continuous AI-powered position monitoring.</p>
                    </div>
                  </div>
                  <Switch 
                    id="monitoring-switch" 
                    defaultChecked
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-accent/20">
                      <Shield className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <Label htmlFor="auto-recovery-switch" className="text-primary font-medium">Auto Recovery</Label>
                      <p className="text-xs text-muted-foreground mt-1">Automatically execute AI recovery plans.</p>
                    </div>
                  </div>
                  <Switch 
                    id="auto-recovery-switch"
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Network className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="cross-chain-switch" className="text-primary font-medium">Cross-Chain Analysis</Label>
                      <p className="text-xs text-muted-foreground mt-1">Monitor positions across multiple networks.</p>
                    </div>
                  </div>
                  <Switch 
                    id="cross-chain-switch" 
                    defaultChecked
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lock className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">Data Protection</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">End-to-end encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Non-custodial operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Zero-knowledge proofs</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">AI Transparency</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full pulse-cyan"></div>
                      <span className="text-sm text-muted-foreground">Explainable AI decisions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full pulse-cyan"></div>
                      <span className="text-sm text-muted-foreground">Audit trail logging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full pulse-cyan"></div>
                      <span className="text-sm text-muted-foreground">Open source algorithms</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
