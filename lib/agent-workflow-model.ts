import type { ComponentType } from "react"
import { Inbox, ListTodo, Stethoscope, Blocks, TrendingUp, FileText } from "lucide-react"

export type AgentStatus = "waiting" | "running" | "complete"

export interface Agent {
  id: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  status: AgentStatus
  progress: number
}

const STEP_BLUEPRINTS: Omit<Agent, "status" | "progress">[] = [
  {
    id: "intake",
    icon: Inbox,
    title: "Request Intake Agent",
    description: "Structures the raw business challenge",
  },
  {
    id: "planner",
    icon: ListTodo,
    title: "Planner Agent",
    description: "Creates an execution plan",
  },
  {
    id: "consultant",
    icon: Stethoscope,
    title: "Consultant Agent",
    description: "Diagnoses root causes and opportunities",
  },
  {
    id: "architect",
    icon: Blocks,
    title: "Solution Architect Agent",
    description: "Designs the AI + automation solution",
  },
  {
    id: "impact",
    icon: TrendingUp,
    title: "Impact Agent",
    description: "Estimates business value",
  },
  {
    id: "summary",
    icon: FileText,
    title: "Final Executive Summary Agent",
    description: "Prepares the final executive-ready output",
  },
]

export function getWaitingAgents(): Agent[] {
  return STEP_BLUEPRINTS.map((b) => ({
    ...b,
    status: "waiting",
    progress: 0,
  }))
}

export function getCompletedAgents(): Agent[] {
  return STEP_BLUEPRINTS.map((b) => ({
    ...b,
    status: "complete",
    progress: 100,
  }))
}

/**
 * Copilot loading animation: one agent "running" at a time, previous complete, rest waiting.
 * Use `activeStep` 0–5 while the request is in flight (last agent stays running until loading ends).
 * `activeStep` 6 = all complete (e.g. after handoff — not driven by the loading timer).
 */
export function buildLoadingSimulationAgents(activeStep: number): Agent[] {
  const capped = Math.min(Math.max(activeStep, 0), 6)
  return STEP_BLUEPRINTS.map((b, i) => {
    if (capped >= 6 || i < capped) {
      return { ...b, status: "complete" as const, progress: 100 }
    }
    if (i === capped) {
      return { ...b, status: "running" as const, progress: 72 }
    }
    return { ...b, status: "waiting" as const, progress: 0 }
  })
}
