"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent, AgentStatus } from "@/lib/agent-workflow-model"

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = {
    waiting: { label: "Waiting", className: "bg-muted text-muted-foreground border-border/50", icon: Clock },
    running: { label: "Running", className: "bg-primary/10 text-primary border-primary/30", icon: Loader2 },
    complete: { label: "Complete", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", icon: Check },
  }
  const { label, className, icon: Icon } = config[status]
  return (
    <Badge variant="outline" className={cn("shrink-0 text-[10px] font-medium px-1.5 py-0", className)}>
      <Icon className={cn("mr-0.5 h-2.5 w-2.5", status === "running" && "animate-spin")} />
      {label}
    </Badge>
  )
}

/** Compact list of agents + status (used in Executive Output during copilot loading). */
export function AgentSequentialList({ agents }: { agents: Agent[] }) {
  return (
    <div className="space-y-2">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={cn(
            "rounded-lg border px-3 py-2.5 transition-colors",
            agent.status === "running"
              ? "border-primary/35 bg-primary/[0.06]"
              : agent.status === "complete"
                ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                : "border-border/40 bg-muted/25"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-tight text-foreground">{agent.title}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{agent.description}</p>
            </div>
            <StatusBadge status={agent.status} />
          </div>
          {agent.status !== "waiting" && (
            <div className="mt-2 flex items-center gap-2">
              <Progress value={agent.progress} className="h-1 flex-1 bg-secondary" />
              <span className="text-[10px] font-medium text-muted-foreground">{agent.progress}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
