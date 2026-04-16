"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  ListChecks,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isError?: boolean
  parsedResponse?: ParsedResponse | null
}

interface ParsedResponse {
  executiveSummary?: string
  keyRecommendations?: string[]
  expectedBusinessValue?: string
  nextSteps?: string[]
  [key: string]: unknown
}

const SAMPLE_PROMPTS = [
  "A retail client wants to reduce operational cost by 20% and improve inventory management.",
  "A bank wants to automate compliance reporting.",
  "A company wants to improve customer service using AI.",
]

/**
 * `NEXT_PUBLIC_N8N_CHAT_ENDPOINT` must be a path on this app (e.g. `/api/n8n/webhook`),
 * not the n8n URL — the browser cannot call n8n directly without n8n allowing your origin (CORS).
 */
const CHAT_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_ENDPOINT?.trim() || "/api/n8n/webhook"

function parseResponse(content: string): ParsedResponse | null {
  try {
    const parsed = JSON.parse(content)
    return parsed
  } catch {
    return null
  }
}

function ResponseCard({ response }: { response: ParsedResponse }) {
  const hasStructuredFields = response.executiveSummary || response.keyRecommendations || response.expectedBusinessValue || response.nextSteps

  if (hasStructuredFields) {
    return (
      <div className="space-y-4">
        {response.executiveSummary && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <h4 className="font-semibold text-sm uppercase tracking-wide">Executive Summary</h4>
            </div>
            <p className="text-foreground/90 leading-relaxed">{response.executiveSummary}</p>
          </div>
        )}

        {response.keyRecommendations && response.keyRecommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-4 w-4" />
              <h4 className="font-semibold text-sm uppercase tracking-wide">Key Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {response.keyRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {response.expectedBusinessValue && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-4 w-4" />
              <h4 className="font-semibold text-sm uppercase tracking-wide">Expected Business Value</h4>
            </div>
            <p className="text-foreground/90 leading-relaxed">{response.expectedBusinessValue}</p>
          </div>
        )}

        {response.nextSteps && response.nextSteps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <ListChecks className="h-4 w-4" />
              <h4 className="font-semibold text-sm uppercase tracking-wide">Next Steps</h4>
            </div>
            <ul className="space-y-2">
              {response.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground/90">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Fallback: display as formatted JSON
  return (
    <pre className="bg-background/50 rounded-lg p-4 text-sm overflow-x-auto border border-border/50">
      <code className="text-foreground/80">{JSON.stringify(response, null, 2)}</code>
    </pre>
  )
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessChallenge: userMessage.content,
          industry: "Retail",
          businessFunction: "Operations",
          objective: "Cost reduction",
          urgency: "High",
          chosenPlatform: "n8n",
          chosenLLM: "OpenAI",
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const responseContent = typeof data === "string" ? data : JSON.stringify(data)
      const parsedResponse = typeof data === "object" ? data : parseResponse(responseContent)

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        parsedResponse,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an issue processing your request. Please try again or contact support if the problem persists.",
        timestamp: new Date(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <section
      id="transformation-copilot"
      className="scroll-mt-24 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Bot className="h-3 w-3 mr-1" />
            AI-Powered Analysis
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Autonomous Business Transformation Copilot
          </h2>
          <p className="text-muted-foreground text-lg">
            AI-Powered Business Transformation Workflow
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Transformation Copilot</h3>
                <p className="text-xs text-muted-foreground">Powered by n8n + OpenAI</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <ScrollArea className="h-[400px] p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Describe Your Business Challenge
                </h4>
                <p className="text-muted-foreground max-w-md mb-6">
                  Tell me about your business transformation needs and I&apos;ll provide AI-powered strategic recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[85%] ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.isError
                              ? "bg-destructive/10 text-destructive"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : message.isError ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.isError
                              ? "bg-destructive/10 border border-destructive/20 text-foreground"
                              : "bg-secondary/50 border border-border text-foreground"
                          }`}
                        >
                          {message.role === "assistant" && message.parsedResponse ? (
                            <ResponseCard response={message.parsedResponse} />
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                          <p
                            className={`text-xs mt-2 ${
                              message.role === "user"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Bot className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="bg-secondary/50 border border-border rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Analyzing your business challenge...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Sample Prompts */}
          {messages.length === 0 && (
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground mb-2">Try a sample prompt:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-left"
                  >
                    {prompt.length > 60 ? prompt.slice(0, 60) + "..." : prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-border bg-secondary/20">
            <div className="flex gap-2 sm:gap-3 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your business transformation challenge..."
                className="min-h-[52px] max-h-[120px] flex-1 resize-none bg-background border-border focus:border-primary focus:ring-primary/20"
                disabled={isLoading}
              />
              <div
                className="animate-copilot-mic-panel-glow relative flex h-[52px] w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08]"
                aria-hidden="true"
                title="Voice input"
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
                  <div
                    className="absolute inset-[-40%] animate-copilot-mic-flow opacity-90 bg-[linear-gradient(105deg,transparent_0%,transparent_38%,rgba(74,222,128,0.55)_50%,rgba(16,185,129,0.75)_52%,rgba(52,211,153,0.45)_54%,transparent_65%,transparent_100%)] bg-[length:220%_100%]"
                    aria-hidden
                  />
                </div>
                <span className="relative z-10 inline-flex animate-copilot-mic-icon-pulse text-emerald-600 dark:text-emerald-400">
                  <Mic className="h-5 w-5" strokeWidth={2.25} />
                </span>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-[52px] shrink-0 px-5 sm:px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
