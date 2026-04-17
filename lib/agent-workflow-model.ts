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
  /** Copilot loading sim only: lines shown while this agent is “running”, cycled in the UI. */
  thinkingMessages?: string[]
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

/** Simulated “what the AI is doing” lines while the loading animation marks this agent as running. */
const RUNNING_THINKING_BY_ID: Record<string, string[]> = {
  intake: [
    "Reading your message and pulling out the core ask…",
    "Separating goals, constraints, and stakeholders from the raw brief…",
    "Turning the challenge into a structured problem statement…",
  ],
  planner: [
    "Breaking the work into phases and checkpoints…",
    "Choosing what to validate first vs. what can follow…",
    "Drafting an execution plan that matches your scope…",
  ],
  consultant: [
    "Scanning for root causes, not just symptoms…",
    "Mapping risks, gaps, and upside you might have missed…",
    "Stress-testing assumptions before we commit to a direction…",
  ],
  architect: [
    "Matching tools and automation to your operating model…",
    "Balancing build vs. buy and where humans stay in the loop…",
    "Sketching a solution shape that scales with volume…",
  ],
  impact: [
    "Translating outcomes into time, cost, and revenue signals…",
    "Sizing value conservatively so leadership can trust the range…",
    "Linking recommendations to measurable KPI movement…",
  ],
  summary: [
    "Condensing the thread into an executive-ready narrative…",
    "Sharpening recommendations so they read as decisions, not essays…",
    "Polishing tone and structure for your leadership audience…",
  ],
}

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
      const thinkingMessages = RUNNING_THINKING_BY_ID[b.id] ?? [b.description]
      return {
        ...b,
        status: "running" as const,
        /** UI animates upward while this step is active; keeps room before 100% until the real response lands. */
        progress: 18,
        thinkingMessages,
      }
    }
    return { ...b, status: "waiting" as const, progress: 0 }
  })
}
