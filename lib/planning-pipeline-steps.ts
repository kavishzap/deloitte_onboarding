import { Layers, ListOrdered, Target, Users } from "lucide-react"
import type { PipelineLoaderStep } from "@/components/pipeline-dialog-loader"

/** Shared step list for planning-style pipeline modals (planning + copilot loading). */
export const PLANNING_PIPELINE_STEPS: PipelineLoaderStep[] = [
  {
    title: "Ingesting proposal & session",
    description: "Structured fields and your saved copilot context are packaged for n8n.",
    icon: Layers,
  },
  {
    title: "Matching people to work",
    description: "Availability, roles, and task hints are aligned for realistic allocation.",
    icon: Users,
  },
  {
    title: "Shaping the Kanban board",
    description: "Columns, swimlanes, and task cards are being composed from the plan.",
    icon: ListOrdered,
  },
  {
    title: "Wiring dependencies & handoff",
    description: "Links between tasks and owners are finalized before the board appears.",
    icon: Target,
  },
]
