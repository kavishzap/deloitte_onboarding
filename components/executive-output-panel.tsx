"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Cpu, Sparkles } from "lucide-react"
import { scrollToAgentWorkflow, useWorkflowWorkspace } from "@/components/workflow-workspace-context"
import type { ParsedResponse } from "@/lib/copilot-response-types"

const COPILOT_SECTION_ID = "transformation-copilot"

function scrollToCopilot() {
  document.getElementById(COPILOT_SECTION_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

function ExecutiveEmptyState({ variant }: { variant: "idle" | "awaiting" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-gradient-to-b from-muted/30 to-muted/10 px-5 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/5 shadow-sm shadow-primary/5">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h4 className="text-sm font-semibold tracking-tight text-foreground">Executive output not loaded</h4>
      <p className="mt-2 max-w-[22rem] text-xs leading-relaxed text-muted-foreground">
        {variant === "awaiting" ? (
          <>
            Your copilot reply is ready. In the chat, press{" "}
            <strong className="text-foreground">Continue</strong> to run the full agent chain and project the
            structured response into this panel.
          </>
        ) : (
          <>
            This panel fills after the copilot returns an answer and you confirm the handoff. While the model is
            working, the <strong className="text-foreground">AI Agent Workflow</strong> section runs each agent in
            sequence; <strong className="text-foreground">Continue</strong> in chat links that run to the executive
            view here.
          </>
        )}
      </p>
      <ol className="mt-5 w-full max-w-[20rem] space-y-2.5 text-left text-[11px] leading-snug text-muted-foreground">
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
            1
          </span>
          <span>Send your business challenge in Transformation Copilot.</span>
        </li>
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
            2
          </span>
          <span>Wait for the reply — workflow agents animate in parallel on the left.</span>
        </li>
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
            3
          </span>
          <span>Press Continue in the chat to execute the sync and display output here.</span>
        </li>
      </ol>
    </div>
  )
}

function ExecutiveBody({ response }: { response: ParsedResponse }) {
  return (
    <div className="space-y-5">
      {response.executiveSummary && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Executive Summary</h4>
          <p className="text-sm leading-relaxed text-foreground">{response.executiveSummary}</p>
        </div>
      )}

      {response.keyRecommendations && response.keyRecommendations.length > 0 && (
        <>
          {response.executiveSummary && <Separator className="bg-border/30" />}
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key Recommendations</h4>
            <ul className="space-y-1.5">
              {response.keyRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {response.expectedBusinessValue && (
        <>
          <Separator className="bg-border/30" />
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expected Business Value</h4>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-medium text-foreground">{response.expectedBusinessValue}</p>
            </div>
          </div>
        </>
      )}

      {response.nextSteps && response.nextSteps.length > 0 && (
        <>
          <Separator className="bg-border/30" />
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next Steps</h4>
            <ol className="space-y-1.5">
              {response.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/50 bg-secondary text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  )
}

export function ExecutiveOutputPanel() {
  const { sessionPhase, executivePayload, executiveFallbackText, loadingSimAgents } =
    useWorkflowWorkspace()

  const hasDisplayContent =
    sessionPhase === "revealed" && !!(executivePayload || executiveFallbackText)

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-2xl border-border/50 bg-card shadow-xl shadow-black/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              Executive Output
              {loadingSimAgents ? (
                <Badge
                  variant="outline"
                  className="ml-auto border-primary/30 bg-primary/10 text-xs text-primary"
                >
                  Running agents…
                </Badge>
              ) : (
                hasDisplayContent && (
                  <Badge
                    variant="outline"
                    className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400"
                  >
                    From copilot
                  </Badge>
                )
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col pt-2">
            <div className="min-h-[10rem] flex-1">
              {loadingSimAgents ? (
                <div className="space-y-3 rounded-xl border border-border/40 bg-muted/15 p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    The <strong className="font-semibold text-foreground">executive summary</strong> will appear
                    here after the copilot responds and you press <strong className="font-semibold text-foreground">Continue</strong> in chat.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Live agent progress is only in <strong className="text-foreground/90">AI Agent Workflow</strong> — it stays on the final agent until the reply is received.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-primary/25 text-xs"
                    onClick={scrollToAgentWorkflow}
                  >
                    Scroll to AI Agent Workflow
                  </Button>
                </div>
              ) : sessionPhase === "revealed" && executivePayload ? (
                <ExecutiveBody response={executivePayload} />
              ) : sessionPhase === "revealed" && executiveFallbackText ? (
                <pre className="max-h-[min(60vh,28rem)] overflow-auto rounded-lg border border-border/40 bg-secondary/30 p-4 font-mono text-xs leading-relaxed text-foreground/90">
                  {executiveFallbackText}
                </pre>
              ) : (
                <ExecutiveEmptyState variant={sessionPhase === "awaiting_continue" ? "awaiting" : "idle"} />
              )}
            </div>

            {hasDisplayContent && (
              <div className="mt-4 border-t border-border/40 pt-4">
                <Button
                  type="button"
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  onClick={scrollToCopilot}
                >
                  <Cpu className="h-4 w-4" />
                  Run Software Proposal Agent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
