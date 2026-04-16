"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { ParsedResponse } from "@/lib/copilot-response-types"
import {
  clearCopilotSession,
  loadCopilotSession,
  saveCopilotSession,
} from "@/lib/copilot-local-session"
import {
  buildLoadingSimulationAgents,
  getCompletedAgents,
  getWaitingAgents,
  type Agent,
} from "@/lib/agent-workflow-model"

export type WorkspaceSessionPhase = "fresh" | "awaiting_continue" | "revealed"

type WorkflowWorkspaceValue = {
  agents: Agent[]
  /** While copilot request is in flight: sequential run animation (mirrors `agents` when null). */
  loadingSimAgents: Agent[] | null
  sessionPhase: WorkspaceSessionPhase
  pendingReplyId: string | null
  executivePayload: ParsedResponse | null
  executiveFallbackText: string | null
  onAssistantReply: (assistantMessageId: string, parsed: ParsedResponse | null, rawContent: string) => void
  confirmContinue: () => void
  restartWorkspace: () => void
  notifyCopilotLoading: (loading: boolean) => void
}

const WorkflowWorkspaceContext = createContext<WorkflowWorkspaceValue | null>(null)

const WORKFLOW_ANCHOR_ID = "agent-workflow"

const LOADING_STEP_MS = 720
/** Max step while the copilot request is in flight — hold on summary agent "running" until the response returns (no fake "all complete"). */
const LOADING_SIM_MAX_STEP = 5

export function scrollToAgentWorkflow() {
  document.getElementById(WORKFLOW_ANCHOR_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

export function WorkflowWorkspaceProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(() => getWaitingAgents())
  const [loadingSimAgents, setLoadingSimAgents] = useState<Agent[] | null>(null)
  const [isCopilotLoading, setIsCopilotLoading] = useState(false)
  const [sessionPhase, setSessionPhase] = useState<WorkspaceSessionPhase>("fresh")
  const [pendingReplyId, setPendingReplyId] = useState<string | null>(null)
  const [pendingParsed, setPendingParsed] = useState<ParsedResponse | null>(null)
  const [pendingRaw, setPendingRaw] = useState<string | null>(null)
  const [executivePayload, setExecutivePayload] = useState<ParsedResponse | null>(null)
  const [executiveFallbackText, setExecutiveFallbackText] = useState<string | null>(null)
  const [workspaceStorageHydrated, setWorkspaceStorageHydrated] = useState(false)
  const loadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const notifyCopilotLoading = useCallback((loading: boolean) => {
    setIsCopilotLoading(loading)
  }, [])

  useEffect(() => {
    if (loadIntervalRef.current) {
      clearInterval(loadIntervalRef.current)
      loadIntervalRef.current = null
    }
    if (!isCopilotLoading) {
      setLoadingSimAgents(null)
      return
    }

    let step = 0
    setLoadingSimAgents(buildLoadingSimulationAgents(0))

    loadIntervalRef.current = setInterval(() => {
      if (step >= LOADING_SIM_MAX_STEP) {
        if (loadIntervalRef.current) {
          clearInterval(loadIntervalRef.current)
          loadIntervalRef.current = null
        }
        return
      }
      step += 1
      setLoadingSimAgents(buildLoadingSimulationAgents(step))
    }, LOADING_STEP_MS)

    return () => {
      if (loadIntervalRef.current) {
        clearInterval(loadIntervalRef.current)
        loadIntervalRef.current = null
      }
      setLoadingSimAgents(null)
    }
  }, [isCopilotLoading])

  useEffect(() => {
    const snap = loadCopilotSession()
    if (snap?.workspace) {
      const w = snap.workspace
      setSessionPhase(w.sessionPhase)
      setPendingReplyId(w.pendingReplyId)
      setPendingParsed(w.pendingParsed)
      setPendingRaw(w.pendingRaw)
      setExecutivePayload(w.executivePayload)
      setExecutiveFallbackText(w.executiveFallbackText)
      if (w.sessionPhase === "revealed") {
        setAgents(getCompletedAgents())
      } else {
        setAgents(getWaitingAgents())
      }
    }
    setWorkspaceStorageHydrated(true)
  }, [])

  useEffect(() => {
    if (!workspaceStorageHydrated) return
    saveCopilotSession({
      workspace: {
        sessionPhase,
        pendingReplyId,
        pendingParsed,
        pendingRaw,
        executivePayload,
        executiveFallbackText,
      },
    })
  }, [
    workspaceStorageHydrated,
    sessionPhase,
    pendingReplyId,
    pendingParsed,
    pendingRaw,
    executivePayload,
    executiveFallbackText,
  ])

  const onAssistantReply = useCallback(
    (assistantMessageId: string, parsed: ParsedResponse | null, rawContent: string) => {
      setPendingReplyId(assistantMessageId)
      setPendingParsed(parsed)
      setPendingRaw(rawContent)
      setSessionPhase("awaiting_continue")
      setAgents(getWaitingAgents())
      setExecutivePayload(null)
      setExecutiveFallbackText(null)
    },
    []
  )

  const confirmContinue = useCallback(() => {
    setAgents(getCompletedAgents())
    const structured =
      pendingParsed &&
      !!(
        pendingParsed.executiveSummary ||
        (pendingParsed.keyRecommendations?.length ?? 0) > 0 ||
        pendingParsed.expectedBusinessValue ||
        (pendingParsed.nextSteps?.length ?? 0) > 0
      )
    if (structured) {
      setExecutivePayload(pendingParsed)
      setExecutiveFallbackText(null)
    } else {
      setExecutivePayload(null)
      setExecutiveFallbackText(pendingRaw?.trim() || null)
    }
    setPendingReplyId(null)
    setPendingParsed(null)
    setPendingRaw(null)
    setSessionPhase("revealed")
    requestAnimationFrame(() => scrollToAgentWorkflow())
  }, [pendingParsed, pendingRaw])

  const restartWorkspace = useCallback(() => {
    clearCopilotSession()
    setAgents(getWaitingAgents())
    setSessionPhase("fresh")
    setPendingReplyId(null)
    setPendingParsed(null)
    setPendingRaw(null)
    setExecutivePayload(null)
    setExecutiveFallbackText(null)
  }, [])

  const value = useMemo(
    () =>
      ({
        agents,
        loadingSimAgents,
        sessionPhase,
        pendingReplyId,
        executivePayload,
        executiveFallbackText,
        onAssistantReply,
        confirmContinue,
        restartWorkspace,
        notifyCopilotLoading,
      }) satisfies WorkflowWorkspaceValue,
    [
      agents,
      loadingSimAgents,
      sessionPhase,
      pendingReplyId,
      executivePayload,
      executiveFallbackText,
      onAssistantReply,
      confirmContinue,
      restartWorkspace,
      notifyCopilotLoading,
    ]
  )

  return (
    <WorkflowWorkspaceContext.Provider value={value}>{children}</WorkflowWorkspaceContext.Provider>
  )
}

export function useWorkflowWorkspace() {
  const ctx = useContext(WorkflowWorkspaceContext)
  if (!ctx) {
    throw new Error("useWorkflowWorkspace must be used within WorkflowWorkspaceProvider")
  }
  return ctx
}

export { WORKFLOW_ANCHOR_ID }
