"use client"

import { Fragment, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent, AgentStatus } from "@/lib/agent-workflow-model"
import { useWorkflowWorkspace, WORKFLOW_ANCHOR_ID } from "@/components/workflow-workspace-context"

const STEP_SHORT_LABEL: Record<string, string> = {
  intake: "Intake",
  planner: "Planner",
  consultant: "Consultant",
  architect: "Architect",
  impact: "Impact",
  summary: "Summary",
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = {
    waiting: { label: "Waiting", className: "bg-muted text-muted-foreground border-border/50", icon: Clock },
    running: { label: "Running", className: "bg-primary/10 text-primary border-primary/30", icon: Loader2 },
    complete: {
      label: "Complete",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      icon: Check,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <Badge variant="outline" className={cn("text-xs font-medium px-2 py-0.5", className)}>
      <Icon className={cn("mr-1 h-3 w-3", status === "running" && "animate-spin")} />
      {label}
    </Badge>
  )
}

function TimelineNode({ agent, index }: { agent: Agent; index: number }) {
  const shortLabel = STEP_SHORT_LABEL[agent.id] ?? agent.title.split(" ")[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 sm:w-[5.25rem] md:w-[6.25rem]"
    >
      <div
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition-all md:h-12 md:w-12",
          agent.status === "running"
            ? "border-primary bg-primary/10 shadow-primary/20 ring-4 ring-primary/15"
            : agent.status === "complete"
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-border/60 bg-muted/40"
        )}
      >
        <agent.icon
          className={cn(
            "h-5 w-5 md:h-[1.35rem] md:w-[1.35rem]",
            agent.status === "running"
              ? "text-primary"
              : agent.status === "complete"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground"
          )}
        />
      </div>
      <span
        className={cn(
          "w-full px-0.5 text-center text-[10px] font-medium leading-tight tracking-tight sm:text-[11px]",
          agent.status === "running" ? "text-primary" : agent.status === "complete" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {shortLabel}
      </span>
    </motion.div>
  )
}

function TimelineConnector({ left, right }: { left: Agent; right: Agent }) {
  const passed = left.status === "complete"
  const pulse = passed && right.status === "running"

  return (
    <div className="flex min-w-[0.5rem] flex-1 items-center self-center pb-6 sm:pb-7" aria-hidden>
      <div
        className={cn(
          "h-0.5 w-full rounded-full transition-colors duration-500",
          !passed && "bg-border/60",
          passed && !pulse && "bg-emerald-500/40",
          pulse && "bg-primary/45"
        )}
      />
    </div>
  )
}

function ActiveAgentStrip({ agent }: { agent: Agent }) {
  const [displayProgress, setDisplayProgress] = useState(agent.progress)
  const [thinkingIndex, setThinkingIndex] = useState(0)

  useEffect(() => {
    if (agent.status !== "running") {
      setDisplayProgress(agent.progress)
      return
    }
    setDisplayProgress(agent.progress)
    const tick = window.setInterval(() => {
      setDisplayProgress((p) => {
        const cap = 92
        if (p >= cap) return p
        return Math.min(cap, p + 3 + Math.floor(Math.random() * 4))
      })
    }, 380)
    return () => window.clearInterval(tick)
  }, [agent.id, agent.status, agent.progress])

  useEffect(() => {
    if (agent.status !== "running" || !agent.thinkingMessages?.length) {
      setThinkingIndex(0)
      return
    }
    setThinkingIndex(0)
    const id = window.setInterval(() => {
      setThinkingIndex((i) => (i + 1) % agent.thinkingMessages!.length)
    }, 2600)
    return () => window.clearInterval(id)
  }, [agent.id, agent.status, agent.thinkingMessages])

  const descriptionText =
    agent.status === "running" && agent.thinkingMessages?.length
      ? agent.thinkingMessages[thinkingIndex % agent.thinkingMessages.length]
      : agent.description

  const progressValue = agent.status === "running" ? displayProgress : agent.progress

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden border-t border-border/40 bg-primary/[0.03] px-3 py-3 sm:px-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <agent.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">{agent.title}</h4>
              <StatusBadge status={agent.status} />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${agent.id}-${descriptionText}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {descriptionText}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        {agent.status !== "waiting" && (
          <div className="flex shrink-0 items-center gap-2 sm:w-48 sm:flex-col sm:items-stretch sm:gap-1.5">
            <Progress
              value={progressValue}
              className="h-1.5 flex-1 bg-secondary transition-all duration-500 ease-out sm:w-full"
            />
            <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground sm:w-full sm:text-left">
              {Math.round(progressValue)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function AgentWorkflowTimeline() {
  const { agents, loadingSimAgents } = useWorkflowWorkspace()
  const displayAgents = loadingSimAgents ?? agents
  const runningAgent = displayAgents.find((a) => a.status === "running")

  return (
    <motion.div
      id={WORKFLOW_ANCHOR_ID}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-2xl border-border/50 bg-card shadow-xl shadow-black/10">
        <CardHeader className="pb-2 pt-5 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            AI Agent Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-4 pt-0 sm:px-6">
          <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-min items-center px-1">
              {displayAgents.map((agent, index) => (
                <Fragment key={agent.id}>
                  <TimelineNode agent={agent} index={index} />
                  {index < displayAgents.length - 1 ? (
                    <TimelineConnector left={agent} right={displayAgents[index + 1]} />
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {runningAgent ? <ActiveAgentStrip key={runningAgent.id} agent={runningAgent} /> : null}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
