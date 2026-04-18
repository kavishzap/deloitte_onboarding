import type { PipelineLoaderStep } from "@/components/pipeline-dialog-loader"
import { Blocks, FileText, Inbox, ListTodo, Stethoscope, TrendingUp } from "lucide-react"

/**
 * Same agent sequence as the former AI Agent Workflow (Intake → … → Summary),
 * used inside the copilot loading modal (`PipelineDialogLoader`).
 */
export const COPILOT_WORKFLOW_PIPELINE_STEPS: PipelineLoaderStep[] = [
  {
    title: "Intake",
    description: "Structures the raw business challenge",
    icon: Inbox,
  },
  {
    title: "Planner",
    description: "Creates an execution plan",
    icon: ListTodo,
  },
  {
    title: "Consultant",
    description: "Diagnoses root causes and opportunities",
    icon: Stethoscope,
  },
  {
    title: "Architect",
    description: "Designs the AI + automation solution",
    icon: Blocks,
  },
  {
    title: "Impact",
    description: "Estimates business value",
    icon: TrendingUp,
  },
  {
    title: "Summary",
    description: "Prepares the final executive-ready output",
    icon: FileText,
  },
]
