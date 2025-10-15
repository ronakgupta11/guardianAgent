"use client"

import { useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AIChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  return (
    <div className="mx-auto max-w-3xl px-6 md:px-10 py-10">
      <h1 className="text-2xl font-semibold mb-2">AI Chat</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ask questions about monitoring, simulations, or recovery planning. The assistant responds in concise, helpful
        steps.
      </p>

      <div className="space-y-4">
        <Card className="p-4 min-h-[50vh]">
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className="flex">
                <div
                  className={[
                    "rounded-md px-3 py-2 max-w-[80%] text-sm leading-relaxed",
                    m.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-foreground",
                  ].join(" ")}
                  role="status"
                  aria-live="polite"
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </Card>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
          aria-label="Send a message to the AI assistant"
        >
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <Input
            id="chat-input"
            name="prompt"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  )
}
