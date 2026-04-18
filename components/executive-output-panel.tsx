"use client"

import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cpu, Loader2, RotateCcw, Sparkles } from "lucide-react"
import { ExecutiveResponseBody } from "@/components/executive-response-body"
import { useSoftwareProposal } from "@/components/software-proposal-context"
import { scrollToAgentWorkflow, useWorkflowWorkspace } from "@/components/workflow-workspace-context"
import { loadCopilotSession } from "@/lib/copilot-local-session"
import { scrollToSoftwareProposalOutput } from "@/lib/workspace-section-ids"

function ExecutiveEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-gradient-to-b from-muted/30 to-muted/10 px-5 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/5 shadow-sm shadow-primary/5">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h4 className="text-sm font-semibold tracking-tight text-foreground">Executive output not loaded</h4>
      <p className="mt-2 max-w-[22rem] text-xs leading-relaxed text-muted-foreground">
        When the copilot responds, the structured executive view is{" "}
        <strong className="text-foreground">filled in here automatically</strong>. While the model is working, the{" "}
        <strong className="text-foreground">AI Agent Workflow</strong> timeline above runs each agent in sequence.
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
          <span>Wait for the reply — workflow agents animate in sequence in the bar above.</span>
        </li>
        <li className="flex gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
            3
          </span>
          <span>When the response arrives, this panel updates on its own with the executive output.</span>
        </li>
      </ol>
    </div>
  )
}

const BUSINESS_PROPOSAL_API = "/api/n8n/business-proposal"

export function ExecutiveOutputPanel() {
  const { sessionPhase, executivePayload, executiveFallbackText, loadingSimAgents, restartWorkspace } =
    useWorkflowWorkspace()
  const { proposalResult, setProposalResult } = useSoftwareProposal()

  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalError, setProposalError] = useState<string | null>(null)

  const hasDisplayContent =
    sessionPhase === "revealed" && !!(executivePayload || executiveFallbackText)

  const runSoftwareProposalAgent = useCallback(async () => {
    setProposalError(null)
    setProposalLoading(true)
    try {
      const copilotSession = loadCopilotSession()
      const res = await fetch(BUSINESS_PROPOSAL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copilotSession }),
      })
      const rawText = await res.text()
      let payload: unknown = rawText
      try {
        payload = rawText ? (JSON.parse(rawText) as unknown) : null
      } catch {
        payload = rawText
      }
      if (!res.ok) {
        const errMsg =
          typeof payload === "object" && payload !== null && "error" in payload
            ? String((payload as { error?: unknown }).error)
            : `Request failed (${res.status})`
        throw new Error(errMsg || `Request failed (${res.status})`)
      }
      setProposalResult(payload)
      scrollToSoftwareProposalOutput()
    } catch (e) {
      setProposalResult(null)
      setProposalError(e instanceof Error ? e.message : "Proposal request failed")
    } finally {
      setProposalLoading(false)
    }
  }, [setProposalResult])

  const startOverEverything = useCallback(() => {
    restartWorkspace()
    setProposalError(null)
    setProposalLoading(false)
  }, [restartWorkspace])

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
              {loadingSimAgents && !hasDisplayContent ? (
                <div className="space-y-3 rounded-xl border border-border/40 bg-muted/15 p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    The <strong className="font-semibold text-foreground">executive summary</strong> will appear here
                    as soon as the copilot finishes responding.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Live agent progress is only in the <strong className="text-foreground/90">AI Agent Workflow</strong> timeline above — it stays on the final agent until the reply is received.
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
                <ExecutiveResponseBody response={executivePayload} />
              ) : sessionPhase === "revealed" && executiveFallbackText ? (
                <pre className="max-h-[min(60vh,28rem)] overflow-auto rounded-lg border border-border/40 bg-secondary/30 p-4 font-mono text-xs leading-relaxed text-foreground/90">
                  {executiveFallbackText}
                </pre>
              ) : (
                <ExecutiveEmptyState />
              )}
            </div>

            {hasDisplayContent && (
              <div className="mt-4 space-y-4 border-t border-border/40 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    type="button"
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    disabled={proposalLoading}
                    onClick={runSoftwareProposalAgent}
                  >
                    {proposalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Cpu className="h-4 w-4" />
                    )}
                    Run Software Application Proposal Agent
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-destructive/35 text-destructive hover:bg-destructive/10 sm:w-auto"
                    disabled={proposalLoading}
                    onClick={startOverEverything}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start over
                  </Button>
                </div>
                {proposalError && (
                  <p className="text-sm text-destructive" role="alert">
                    {proposalError}
                  </p>
                )}
                {proposalResult !== null && proposalResult !== undefined && !proposalError && (
                  <p className="text-xs text-muted-foreground">
                    The proposal is shown in a full-width section below the workflow.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
