"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
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
import { DeloitteListeningPortal } from "@/components/deloitte-listening-portal"
import { inferChatWebhookContext } from "@/lib/infer-webhook-context"
import type { ParsedResponse } from "@/lib/copilot-response-types"
import {
  loadCopilotSession,
  messagesToSerializable,
  saveCopilotSession,
} from "@/lib/copilot-local-session"
import { useWorkflowWorkspace } from "@/components/workflow-workspace-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isError?: boolean
  parsedResponse?: ParsedResponse | null
}

const SAMPLE_PROMPTS = [
  "A retail client wants to reduce operational cost by 20% and improve inventory management.",
  "A bank wants to automate compliance reporting.",
  "A company wants to improve customer service using AI.",
]

const LOADING_HINTS = [
  "Running your brief through the n8n workflow — complex answers can take a little longer.",
  "Synthesising recommendations so they land in an executive-ready format.",
  "Still here — large payloads or cold starts sometimes add extra seconds.",
  "You can keep working elsewhere in the tab; this reply will appear as soon as it is ready.",
] as const

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
  const {
    onAssistantReply,
    confirmContinue,
    restartWorkspace,
    pendingReplyId,
    sessionPhase,
    notifyCopilotLoading,
  } = useWorkflowWorkspace()
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesStorageHydrated, setMessagesStorageHydrated] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [listeningOpen, setListeningOpen] = useState(false)
  const [loadingHintIndex, setLoadingHintIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const snap = loadCopilotSession()
    if (snap?.messages?.length) {
      setMessages(
        snap.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
          isError: m.isError,
          parsedResponse: m.parsedResponse ?? undefined,
        }))
      )
    }
    setMessagesStorageHydrated(true)
  }, [])

  useEffect(() => {
    if (!messagesStorageHydrated) return
    saveCopilotSession({ messages: messagesToSerializable(messages) })
  }, [messagesStorageHydrated, messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (!isLoading) return
    setLoadingHintIndex(0)
    const id = window.setInterval(() => {
      setLoadingHintIndex((i) => (i + 1) % LOADING_HINTS.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [isLoading])

  useEffect(() => {
    notifyCopilotLoading(isLoading)
  }, [isLoading, notifyCopilotLoading])

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
      const inferred = inferChatWebhookContext(userMessage.content)
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessChallenge: userMessage.content,
          industry: inferred.industry,
          businessFunction: inferred.businessFunction,
          objective: inferred.objective,
          urgency: inferred.urgency,
          chosenPlatform: inferred.chosenPlatform,
          chosenLLM: inferred.chosenLLM,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      const responseContent = typeof data === "string" ? data : JSON.stringify(data)
      const parsedResponse =
        typeof data === "object" && data !== null && !Array.isArray(data)
          ? (data as ParsedResponse)
          : parseResponse(responseContent)

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        parsedResponse,
      }

      setMessages((prev) => [...prev, assistantMessage])
      onAssistantReply(
        assistantMessage.id,
        parsedResponse ?? null,
        assistantMessage.content
      )
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
    restartWorkspace()
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
      <DeloitteListeningPortal open={listeningOpen} onClose={() => setListeningOpen(false)} />
      <div className="max-w-6xl mx-auto">
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
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Autonomous Business Transformation Copilot
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10 lg:items-stretch">
          {/* Left: illustration (1/3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-center lg:col-span-1"
          >
            <div className="relative mx-auto w-full max-w-sm max-h-[min(70vh,28rem)] lg:mx-0 lg:max-w-none lg:max-h-none lg:h-full lg:min-h-[22rem]">
              <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-2xl" />
              <motion.div
                className="relative aspect-[4/5] w-full overflow-hidden bg-transparent lg:aspect-auto lg:h-full lg:min-h-[22rem]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="relative h-full w-full origin-center will-change-transform"
                  animate={{
                    scale: [1, 1.07, 1.03, 1.08, 1],
                    x: [0, "3%", "-2%", "2%", 0],
                    y: [0, "-2%", "1.5%", "-1%", 0],
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/chat.png"
                    alt="Transformation Copilot chat preview"
                    fill
                    className="scale-[1.02] object-contain object-center p-3 sm:p-4"
                    sizes="(max-width: 1024px) 90vw, 33vw"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: chat (2/3) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0"
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
                          {message.role === "assistant" &&
                            !message.isError &&
                            sessionPhase === "awaiting_continue" &&
                            pendingReplyId === message.id && (
                              <div className="mt-3 border-t border-border/60 pt-3">
                                <p className="mb-2 text-xs text-muted-foreground">
                                  Sync the workspace with this reply, or start over.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      restartWorkspace()
                                      setMessages([])
                                    }}
                                  >
                                    Restart
                                  </Button>
                                  <Button type="button" size="sm" onClick={confirmContinue}>
                                    Continue
                                  </Button>
                                </div>
                              </div>
                            )}
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
                      <motion.div
                        className="relative flex h-8 w-8 shrink-0 items-center justify-center"
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span
                          className="pointer-events-none absolute inset-0 rounded-lg bg-primary/25 blur-[6px]"
                          aria-hidden
                        />
                        <div className="relative flex h-full w-full items-center justify-center rounded-lg border border-primary/25 bg-secondary">
                          <Bot className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                      </motion.div>
                      <div className="min-w-0 max-w-[min(100%,22rem)] rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-secondary/45 to-secondary/30 px-4 py-3.5 shadow-sm">
                        <div className="flex gap-2.5">
                          <Loader2
                            className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary"
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1 space-y-2.5">
                            <p className="text-sm font-medium leading-snug text-foreground">
                              Analyzing your business challenge
                              <span className="inline-flex translate-y-px gap-0.5 pl-0.5" aria-hidden>
                                {[0, 1, 2].map((i) => (
                                  <motion.span
                                    key={i}
                                    className="inline-block h-1 w-1 rounded-full bg-primary"
                                    animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      delay: i * 0.18,
                                      ease: "easeInOut",
                                    }}
                                  />
                                ))}
                              </span>
                            </p>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/90">
                              <motion.div
                                className="h-full w-[42%] rounded-full bg-gradient-to-r from-transparent via-primary/80 to-transparent"
                                initial={false}
                                animate={{ x: ["-30%", "220%"] }}
                                transition={{
                                  duration: 1.65,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                            </div>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={loadingHintIndex}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.28 }}
                                className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs"
                              >
                                {LOADING_HINTS[loadingHintIndex]}
                              </motion.p>
                            </AnimatePresence>
                          </div>
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
              <button
                type="button"
                title={listeningOpen ? "Close voice copilot" : "Open voice copilot"}
                aria-pressed={listeningOpen}
                aria-label={listeningOpen ? "Close Deloitte copilot listener" : "Open Deloitte copilot listener"}
                onClick={() => setListeningOpen((o) => !o)}
                className={`animate-copilot-mic-panel-glow relative flex h-[52px] w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-emerald-500/[0.08] transition-[box-shadow,border-color] ${
                  listeningOpen
                    ? "border-emerald-400 ring-2 ring-emerald-400/50"
                    : "border-emerald-500/40 hover:border-emerald-400/70"
                }`}
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
              </button>
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
      </div>
    </section>
  )
}
