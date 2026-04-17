"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent, AgentStatus } from "@/lib/agent-workflow-model"
import { useWorkflowWorkspace, WORKFLOW_ANCHOR_ID } from "@/components/workflow-workspace-context"

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = {
    waiting: { label: "Waiting", className: "bg-muted text-muted-foreground border-border/50", icon: Clock },
    running: { label: "Running", className: "bg-primary/10 text-primary border-primary/30", icon: Loader2 },
    complete: { label: "Complete", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", icon: Check },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <Badge variant="outline" className={cn("text-xs font-medium px-2 py-0.5", className)}>
      <Icon className={cn("mr-1 h-3 w-3", status === "running" && "animate-spin")} />
      {label}
    </Badge>
  )
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
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
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <div
        className={cn(
          "relative rounded-xl border p-4 transition-all",
          agent.status === "running"
            ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
            : agent.status === "complete"
              ? "border-border/50 bg-card hover:border-primary/30"
              : "border-border/30 bg-card/50 opacity-70"
        )}
      >
        {index < 5 && <div className="absolute left-8 top-full h-4 w-0.5 bg-border/50" />}

        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
              agent.status === "running"
                ? "border-primary/30 bg-primary/10"
                : agent.status === "complete"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-border/50 bg-muted"
            )}
          >
            <agent.icon
              className={cn(
                "h-5 w-5",
                agent.status === "running"
                  ? "text-primary"
                  : agent.status === "complete"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground"
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-medium text-foreground">{agent.title}</h4>
              <StatusBadge status={agent.status} />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${agent.id}-${descriptionText}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="mb-2 text-xs text-muted-foreground"
              >
                {descriptionText}
              </motion.p>
            </AnimatePresence>

            {agent.status !== "waiting" && (
              <div className="flex items-center gap-2">
                <Progress value={progressValue} className="h-1.5 flex-1 bg-secondary transition-all duration-500 ease-out" />
                <span className="text-xs font-medium text-muted-foreground">{Math.round(progressValue)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AgentWorkflowTimeline() {
  const { agents, loadingSimAgents } = useWorkflowWorkspace()
  const displayAgents = loadingSimAgents ?? agents

  return (
    <motion.div
      id={WORKFLOW_ANCHOR_ID}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full rounded-2xl border-border/50 bg-card shadow-xl shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            AI Agent Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
