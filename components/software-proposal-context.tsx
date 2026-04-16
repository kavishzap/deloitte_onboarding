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
}

const SoftwareProposalContext = createContext<SoftwareProposalContextValue | null>(null)

export function SoftwareProposalProvider({ children }: { children: ReactNode }) {
  const { registerSessionResetHandler } = useWorkflowWorkspace()
  const [proposalResult, setProposalResult] = useState<unknown | null>(null)
  const [planningBoard, setPlanningBoard] = useState<KanbanBoardPayload | null>(null)

  useEffect(() => {
    return registerSessionResetHandler(() => {
      setProposalResult(null)
      setPlanningBoard(null)
    })
  }, [registerSessionResetHandler])

  useEffect(() => {
    setPlanningBoard(null)
  }, [proposalResult])

  const value = useMemo(
    () => ({
      proposalResult,
      setProposalResult,
      planningBoard,
      setPlanningBoard,
    }),
    [proposalResult, planningBoard]
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
