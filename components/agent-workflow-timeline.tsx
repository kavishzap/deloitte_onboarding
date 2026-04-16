"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, Inbox, ListTodo, Stethoscope, Blocks, TrendingUp, FileText, Check, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type AgentStatus = "waiting" | "running" | "complete"

interface Agent {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  status: AgentStatus
  progress: number
  output?: string
}

const initialAgents: Agent[] = [
  {
    id: "intake",
    icon: Inbox,
    title: "Request Intake Agent",
    description: "Structures the raw business challenge",
    status: "complete",
    progress: 100,
    output: '{\n  "industry": "Retail",\n  "objective": "Cost Reduction",\n  "target": "20% operational cost reduction",\n  "focus_area": "Inventory Management",\n  "priority": "High"\n}'
  },
  {
    id: "planner",
    icon: ListTodo,
    title: "Planner Agent",
    description: "Creates an execution plan",
    status: "complete",
    progress: 100,
    output: '{\n  "phases": [\n    "Discovery & Assessment",\n    "Solution Design",\n    "Pilot Implementation",\n    "Scale & Optimize"\n  ],\n  "timeline": "12 weeks",\n  "milestones": 4\n}'
  },
  {
    id: "consultant",
    icon: Stethoscope,
    title: "Consultant Agent",
    description: "Diagnoses root causes and opportunities",
    status: "running",
    progress: 65,
    output: '{\n  "root_causes": [\n    "Manual inventory processes",\n    "Lack of demand forecasting",\n    "Siloed data systems"\n  ],\n  "opportunities": [\n    "AI-driven demand prediction",\n    "Automated reordering"\n  ]\n}'
  },
  {
    id: "architect",
    icon: Blocks,
    title: "Solution Architect Agent",
    description: "Designs the AI + automation solution",
    status: "waiting",
    progress: 0,
    output: undefined
  },
  {
    id: "impact",
    icon: TrendingUp,
    title: "Impact Agent",
    description: "Estimates business value",
    status: "waiting",
    progress: 0,
    output: undefined
  },
  {
    id: "summary",
    icon: FileText,
    title: "Final Executive Summary Agent",
    description: "Prepares the final executive-ready output",
    status: "waiting",
    progress: 0,
    output: undefined
  },
]

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
  const [expanded, setExpanded] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div 
        className={cn(
          "relative p-4 rounded-xl border transition-all cursor-pointer",
          agent.status === "running" 
            ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5" 
            : agent.status === "complete"
            ? "bg-card border-border/50 hover:border-primary/30"
            : "bg-card/50 border-border/30 opacity-60"
        )}
        onClick={() => agent.output && setExpanded(!expanded)}
      >
        {/* Timeline connector */}
        {index < 5 && (
          <div className="absolute left-8 top-full w-0.5 h-4 bg-border/50" />
        )}
        
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
            agent.status === "running" 
              ? "bg-primary/10 border-primary/30" 
              : agent.status === "complete"
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-muted border-border/50"
          )}>
            <agent.icon className={cn(
              "h-5 w-5",
              agent.status === "running" 
                ? "text-primary" 
                : agent.status === "complete"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground truncate">{agent.title}</h4>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
            
            {agent.status !== "waiting" && (
              <div className="flex items-center gap-2">
                <Progress value={agent.progress} className="h-1.5 flex-1 bg-secondary" />
                <span className="text-xs text-muted-foreground font-medium">{agent.progress}%</span>
              </div>
            )}
            
            {agent.output && (
              <button className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Hide" : "Preview"} output
              </button>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {expanded && agent.output && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <pre className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border/30 text-xs text-muted-foreground overflow-x-auto font-mono">
                {agent.output}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function AgentWorkflowTimeline() {
  const [agents] = useState<Agent[]>(initialAgents)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10 h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            AI Agent Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
