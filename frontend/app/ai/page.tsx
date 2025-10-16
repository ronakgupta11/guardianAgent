"use client"

import { useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  Brain, 
  Bot, 
  Send, 
  Zap, 
  MessageCircle,
  Cpu,
  Network
} from "lucide-react"

export default function AIChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 neural-network opacity-10"></div>
      <div className="absolute top-20 left-10 w-1 h-1 bg-primary rounded-full pulse-cyan"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-accent rounded-full pulse-cyan" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-primary rounded-full pulse-cyan" style={{animationDelay: '2s'}}></div>
      
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
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 rounded-full bg-gradient-to-r from-primary to-accent"
            >
              <Brain className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Guardian Assistant
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your intelligent DeFi companion powered by neural networks. Ask about risk analysis, recovery strategies, or market insights.
          </p>
        </motion.div>

        {/* AI Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="flex items-center gap-2 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-primary/20">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Neural Analysis</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-primary/20">
            <Network className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Multi-Chain Support</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-primary/20">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Real-time Insights</span>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 ai-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <MessageCircle className="w-5 h-5" />
                  AI Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center py-12"
                    >
                      <Bot className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Hello! I'm your AI Guardian Assistant. How can I help you with your DeFi positions today?
                      </p>
                    </motion.div>
                  )}
                  
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex"
                    >
                      <div
                        className={[
                          "rounded-lg px-4 py-3 max-w-[85%] text-sm leading-relaxed",
                          m.role === "user" 
                            ? "bg-gradient-to-r from-primary to-blue-600 text-primary-foreground ml-auto" 
                            : "bg-card/60 border border-primary/20 text-foreground",
                        ].join(" ")}
                        role="status"
                        aria-live="polite"
                      >
                        {m.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-primary" />
                            <span className="text-xs text-primary font-medium">AI Guardian</span>
                          </div>
                        )}
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
              <CardContent className="p-6">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-3"
                  aria-label="Send a message to the AI assistant"
                >
                  <label htmlFor="chat-input" className="sr-only">
                    Type your message
                  </label>
                  <Input
                    id="chat-input"
                    name="prompt"
                    placeholder="Ask about risk analysis, recovery strategies, or market insights..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="flex-1 border-primary/20 focus:border-primary"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="web3-gradient text-primary-foreground"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Send className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
