"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet } from "@/components/Wallet"
import { motion } from "framer-motion"
import { 
  User, 
  Shield, 
  Brain, 
  Network, 
  Settings,
  Camera,
  Save,
  X
} from "lucide-react"

export default function ProfilePage() {
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
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-full bg-gradient-to-r from-primary to-accent"
            >
              <User className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Guardian Profile
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your AI-powered DeFi guardian profile and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent p-1">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">DeFi Guardian</h3>
                    <p className="text-muted-foreground">AI-Powered Risk Manager</p>
                    <Button variant="outline" className="mt-2 border-primary/50 text-primary hover:bg-primary/10">
                      Change Avatar
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-primary font-medium">Guardian Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Satoshi Nakamoto" 
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-primary font-medium">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="satoshi@example.com"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-primary font-medium">Bio</Label>
                  <textarea
                    id="bio"
                    placeholder="Tell us about your DeFi experience and goals..."
                    className="w-full p-3 rounded-lg border border-primary/20 bg-card/60 focus:border-primary focus:outline-none resize-none h-24"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button className="web3-gradient text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Guardian Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  AI Guardian Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk Analysis</span>
                  <span className="text-primary font-semibold">99.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Positions Monitored</span>
                  <span className="text-primary font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recovery Actions</span>
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="text-primary font-semibold">99.9%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Network className="w-5 h-5" />
                  Connected Networks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full pulse-cyan"></div>
                  <span className="text-sm">Ethereum Mainnet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full pulse-cyan"></div>
                  <span className="text-sm">Polygon</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Arbitrum</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Wallet />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
