"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { KanbanBoardPayload } from "@/lib/kanban-planning-types"
import { useWorkflowWorkspace } from "@/components/workflow-workspace-context"

type SoftwareProposalContextValue = {
  proposalResult: unknown | null
  setProposalResult: (value: unknown | null) => void
  planningBoard: KanbanBoardPayload | null
  setPlanningBoard: (value: KanbanBoardPayload | null) => void
  /** HTML fragment from the “repository / HTML” n8n agent, shown under the Kanban. */
  repositoryHtml: string | null
  setRepositoryHtml: (value: string | null) => void
}

const SoftwareProposalContext = createContext<SoftwareProposalContextValue | null>(null)

export function SoftwareProposalProvider({ children }: { children: ReactNode }) {
  const { registerSessionResetHandler } = useWorkflowWorkspace()
  const [proposalResult, setProposalResult] = useState<unknown | null>(null)
  const [planningBoard, setPlanningBoard] = useState<KanbanBoardPayload | null>(null)
  const [repositoryHtml, setRepositoryHtml] = useState<string | null>(null)

  useEffect(() => {
    return registerSessionResetHandler(() => {
      setProposalResult(null)
      setPlanningBoard(null)
      setRepositoryHtml(null)
    })
  }, [registerSessionResetHandler])

  useEffect(() => {
    setPlanningBoard(null)
    setRepositoryHtml(null)
  }, [proposalResult])

  const value = useMemo(
    () => ({
      proposalResult,
      setProposalResult,
      planningBoard,
      setPlanningBoard,
      repositoryHtml,
      setRepositoryHtml,
    }),
    [proposalResult, planningBoard, repositoryHtml]
  )

  return <SoftwareProposalContext.Provider value={value}>{children}</SoftwareProposalContext.Provider>
}

export function useSoftwareProposal() {
  const ctx = useContext(SoftwareProposalContext)
  if (!ctx) {
    throw new Error("useSoftwareProposal must be used within SoftwareProposalProvider")
  }
  return ctx
}
