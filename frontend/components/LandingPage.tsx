'use client';

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HealthRing } from "@/components/health-ring";
import { motion } from "framer-motion";
import { 
  Brain, 
  Shield, 
  Zap, 
  Network, 
  Cpu, 
  Activity,
  TrendingUp,
  Lock,
  Eye,
  Bot,
  Coins,
  Globe,
  ArrowRight
} from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 neural-network opacity-20"></div>
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full pulse-cyan"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-accent rounded-full pulse-cyan" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-primary rounded-full pulse-cyan" style={{animationDelay: '2s'}}></div>
      
      <div className="px-6 md:px-10 relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary backdrop-blur-sm">
                <Bot className="w-4 h-4" />
                AI-Powered DeFi Guardian • Neural Network Analysis • Web3 Native
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              GuardianAgent
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-8">
              Your AI-powered DeFi guardian that monitors, simulates, and recovers positions with 
              <span className="text-primary font-semibold"> neural network precision</span> and 
              <span className="text-accent font-semibold"> blockchain transparency</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg" className="web3-gradient text-primary-foreground hover:opacity-90 ai-glow">
                <Link href="/login" className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Link href="/ai" className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Assistant
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Live Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <HealthRing healthFactor={1.42} size={120} />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Live Health Factor</p>
                        <p className="text-xs text-primary">AI Monitoring Active</p>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="hidden md:block h-20 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>
                  
                  <div className="hidden md:block space-y-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">$2.4M Monitored</p>
                        <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm font-semibold">99.7% Uptime</p>
                        <p className="text-xs text-muted-foreground">AI Guardian Active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">0.3s Response</p>
                        <p className="text-xs text-muted-foreground">Risk Detection Speed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* AI-Powered Features */}
        <section id="features" className="mx-auto max-w-7xl py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Harness the power of neural networks and blockchain technology to protect your DeFi positions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AIFeature
              icon={<Brain className="w-8 h-8" />}
              title="Neural Risk Analysis"
              desc="Advanced AI models analyze market patterns, volatility, and liquidation risks in real-time with 99.7% accuracy."
              gradient="from-primary to-blue-600"
            />
            <AIFeature
              icon={<Eye className="w-8 h-8" />}
              title="Predictive Monitoring"
              desc="Machine learning algorithms predict potential liquidation events before they occur, giving you time to act."
              gradient="from-accent to-purple-600"
            />
            <AIFeature
              icon={<Zap className="w-8 h-8" />}
              title="Instant Recovery"
              desc="AI-crafted recovery plans execute in milliseconds, automatically rebalancing your positions for optimal health."
              gradient="from-primary to-cyan-600"
            />
            <AIFeature
              icon={<Network className="w-8 h-8" />}
              title="Cross-Chain Intelligence"
              desc="Multi-chain AI agents monitor positions across Ethereum, Polygon, and other networks simultaneously."
              gradient="from-accent to-indigo-600"
            />
            <AIFeature
              icon={<Shield className="w-8 h-8" />}
              title="Smart Contract Security"
              desc="AI-powered security analysis ensures all recovery operations are safe and non-custodial."
              gradient="from-primary to-green-600"
            />
            <AIFeature
              icon={<Cpu className="w-8 h-8" />}
              title="Adaptive Learning"
              desc="The system learns from your trading patterns and market conditions to provide personalized protection."
              gradient="from-accent to-pink-600"
            />
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mx-auto max-w-7xl py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              How GuardianAgent Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to AI-powered DeFi protection
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <AIWorkStep 
              n={1} 
              icon={<Network className="w-8 h-8" />}
              title="Connect & Monitor" 
              desc="Link your wallet or use demo mode. AI agents instantly begin monitoring your positions across all connected networks." 
            />
            <AIWorkStep
              n={2}
              icon={<Brain className="w-8 h-8" />}
              title="AI Analysis"
              desc="Neural networks analyze market conditions, predict risks, and simulate potential scenarios in real-time."
            />
            <AIWorkStep
              n={3}
              icon={<Zap className="w-8 h-8" />}
              title="Auto-Recovery"
              desc="When risks are detected, AI generates and executes recovery plans automatically, keeping your positions safe."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-card/60 backdrop-blur-xl border-primary/20 ai-glow">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Ready to Protect Your DeFi Positions?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of DeFi users who trust GuardianAgent to keep their positions safe with AI-powered monitoring and recovery.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="web3-gradient text-primary-foreground ai-glow">
                    <Link href="/login" className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Start Protecting Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <Link href="/ai" className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Chat with AI
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

function AIFeature({ 
  icon, 
  title, 
  desc, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-card/60 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-300 ai-scan-line">
        <CardContent className="p-8">
          <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${gradient} mb-4`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3 text-primary">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AIWorkStep({ 
  n, 
  icon, 
  title, 
  desc 
}: { 
  n: number; 
  icon: React.ReactNode; 
  title: string; 
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: n * 0.1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <Card className="bg-card/60 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-300">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-30"></div>
            <div className="relative bg-gradient-to-r from-primary to-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <div className="text-primary-foreground font-bold text-xl">{n}</div>
            </div>
          </div>
          <div className="mb-4 text-primary">
            {icon}
          </div>
          <h4 className="text-xl font-semibold mb-3">{title}</h4>
          <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
