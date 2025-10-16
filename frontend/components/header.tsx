"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletChip } from "@/components/wallet-chip"
import { useDemoMode } from "@/providers/demo-mode"
import { useAuth } from "@/contexts/AuthContext"
import { Bot, Brain, Shield, LogOut, User } from "lucide-react"
import { motion } from "framer-motion"

export function Header() {
  const { demo, toggleDemo } = useDemoMode()
  const { user, isAuthenticated, logout } = useAuth()
  return (
    <header className="border-b border-primary/20 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 relative">
      {/* AI Scan Line Effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-1 rounded-full bg-gradient-to-r from-primary to-accent"
          >
            <Bot className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GuardianAgent
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Dashboard
              </Link>
              <Link href="/ai" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />
                AI Assistant
              </Link>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Profile
              </Link>
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Settings
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={logout}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
          
          <Button 
            variant={demo ? "default" : "outline"} 
            onClick={toggleDemo} 
            aria-pressed={demo}
            className={demo ? "web3-gradient text-primary-foreground" : "border-primary/50 text-primary hover:bg-primary/10"}
          >
            {demo ? "Demo Active" : "Demo Mode"}
          </Button>
          <WalletChip />
        </div>
      </div>
    </header>
  )
}
