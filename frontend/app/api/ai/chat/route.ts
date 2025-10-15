import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: "openai/gpt-5-mini",
    messages,
    abortSignal: req.signal,
    temperature: 0.4,
    system:
      "You are GuardianAgent, a helpful assistant for DeFi risk monitoring, simulation, and recovery planning. Be concise, clear, and safety-first.",
  })

  return result.toAIStreamResponse()
}
