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
import { clearCopilotSession, loadCopilotSession, saveCopilotSession } from "@/lib/copilot-local-session"

export type WorkspaceSessionPhase = "fresh" | "awaiting_continue" | "revealed"

export const EXECUTIVE_OUTPUT_ANCHOR_ID = "executive-output-panel"

type WorkflowWorkspaceValue = {
  /** True while the Transformation Copilot request is in flight (progress lives in the chat modal). */
  isCopilotLoading: boolean
  sessionPhase: WorkspaceSessionPhase
  pendingReplyId: string | null
  executivePayload: ParsedResponse | null
  executiveFallbackText: string | null
  onAssistantReply: (assistantMessageId: string, parsed: ParsedResponse | null, rawContent: string) => void
  confirmContinue: () => void
  restartWorkspace: () => void
  /** Chat / proposal UI register so `restartWorkspace` also clears local session views. Returns unsubscribe. */
  registerSessionResetHandler: (handler: () => void) => () => void
  notifyCopilotLoading: (loading: boolean) => void
}

const WorkflowWorkspaceContext = createContext<WorkflowWorkspaceValue | null>(null)

export function scrollToExecutiveOutput() {
  document.getElementById(EXECUTIVE_OUTPUT_ANCHOR_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

/** @deprecated Use scrollToExecutiveOutput — workflow timeline was removed. */
export function scrollToAgentWorkflow() {
  scrollToExecutiveOutput()
}

export function WorkflowWorkspaceProvider({ children }: { children: ReactNode }) {
  const [isCopilotLoading, setIsCopilotLoading] = useState(false)
  const [sessionPhase, setSessionPhase] = useState<WorkspaceSessionPhase>("fresh")
  const [pendingReplyId, setPendingReplyId] = useState<string | null>(null)
  const [pendingParsed, setPendingParsed] = useState<ParsedResponse | null>(null)
  const [pendingRaw, setPendingRaw] = useState<string | null>(null)
  const [executivePayload, setExecutivePayload] = useState<ParsedResponse | null>(null)
  const [executiveFallbackText, setExecutiveFallbackText] = useState<string | null>(null)
  const [workspaceStorageHydrated, setWorkspaceStorageHydrated] = useState(false)
  const sessionResetHandlersRef = useRef(new Set<() => void>())

  const notifyCopilotLoading = useCallback((loading: boolean) => {
    setIsCopilotLoading(loading)
  }, [])

  useEffect(() => {
    const snap = loadCopilotSession()
    if (snap?.workspace) {
      const w = snap.workspace
      const hasPendingContent =
        w.pendingParsed !== null ||
        (typeof w.pendingRaw === "string" && w.pendingRaw.trim().length > 0)

      if (w.sessionPhase === "awaiting_continue" && hasPendingContent) {
        const parsed = w.pendingParsed
        const raw = typeof w.pendingRaw === "string" ? w.pendingRaw : ""
        const structured =
          parsed &&
          !!(
            parsed.executiveSummary ||
            (parsed.keyRecommendations?.length ?? 0) > 0 ||
            parsed.expectedBusinessValue ||
            (parsed.nextSteps?.length ?? 0) > 0
          )
        if (structured) {
          setExecutivePayload(parsed)
          setExecutiveFallbackText(null)
        } else {
          setExecutivePayload(null)
          setExecutiveFallbackText(raw.trim() || null)
        }
        setSessionPhase("revealed")
        setPendingReplyId(null)
        setPendingParsed(null)
        setPendingRaw(null)
      } else {
        setSessionPhase(w.sessionPhase)
        setPendingReplyId(w.pendingReplyId)
        setPendingParsed(w.pendingParsed)
        setPendingRaw(w.pendingRaw)
        setExecutivePayload(w.executivePayload)
        setExecutiveFallbackText(w.executiveFallbackText)
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

  const revealExecutiveFromParsed = useCallback((parsed: ParsedResponse | null, rawContent: string) => {
    const structured =
      parsed &&
      !!(
        parsed.executiveSummary ||
        (parsed.keyRecommendations?.length ?? 0) > 0 ||
        parsed.expectedBusinessValue ||
        (parsed.nextSteps?.length ?? 0) > 0
      )
    if (structured) {
      setExecutivePayload(parsed)
      setExecutiveFallbackText(null)
    } else {
      setExecutivePayload(null)
      setExecutiveFallbackText(rawContent.trim() || null)
    }
    setPendingReplyId(null)
    setPendingParsed(null)
    setPendingRaw(null)
    setSessionPhase("revealed")
    requestAnimationFrame(() => scrollToExecutiveOutput())
  }, [])

  const onAssistantReply = useCallback(
    (_assistantMessageId: string, parsed: ParsedResponse | null, rawContent: string) => {
      revealExecutiveFromParsed(parsed, rawContent)
    },
    [revealExecutiveFromParsed]
  )

  /** Legacy: completes reveal if old sessions still had pending workspace data. */
  const confirmContinue = useCallback(() => {
    if (pendingParsed !== null || (pendingRaw !== null && pendingRaw.trim() !== "")) {
      revealExecutiveFromParsed(pendingParsed, pendingRaw ?? "")
    }
  }, [pendingParsed, pendingRaw, revealExecutiveFromParsed])

  const registerSessionResetHandler = useCallback((handler: () => void) => {
    const set = sessionResetHandlersRef.current
    set.add(handler)
    return () => {
      set.delete(handler)
    }
  }, [])

  const restartWorkspace = useCallback(() => {
    clearCopilotSession()
    setSessionPhase("fresh")
    setPendingReplyId(null)
    setPendingParsed(null)
    setPendingRaw(null)
    setExecutivePayload(null)
    setExecutiveFallbackText(null)
    for (const fn of sessionResetHandlersRef.current) {
      try {
        fn()
      } catch {
        /* ignore subscriber errors */
      }
    }
  }, [])

  const value = useMemo(
    () =>
      ({
        isCopilotLoading,
        sessionPhase,
        pendingReplyId,
        executivePayload,
        executiveFallbackText,
        onAssistantReply,
        confirmContinue,
        restartWorkspace,
        registerSessionResetHandler,
        notifyCopilotLoading,
      }) satisfies WorkflowWorkspaceValue,
    [
      isCopilotLoading,
      sessionPhase,
      pendingReplyId,
      executivePayload,
      executiveFallbackText,
      onAssistantReply,
      confirmContinue,
      restartWorkspace,
      registerSessionResetHandler,
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
