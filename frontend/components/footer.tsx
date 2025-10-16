import { Bot, Shield, Brain } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-card/60 backdrop-blur-xl">
      {/* AI Scan Line Effect */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
      
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-20 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">© {new Date().getFullYear()} GuardianAgent</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>AI-Powered Protection</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="w-4 h-4 text-accent" />
            <span>Neural Network Analysis</span>
          </div>
        </div>
        
        <span className="text-muted-foreground">Demo-only. Not financial advice.</span>
      </div>
    </footer>
  )
}
