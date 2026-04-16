import type { ParsedResponse } from "@/lib/copilot-response-types"

export type WorkspaceSessionPhase = "fresh" | "awaiting_continue" | "revealed"

const STORAGE_KEY = "transformation-copilot-session-v1"

export type SerializableMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  isError?: boolean
  parsedResponse?: ParsedResponse | null
}

export type CopilotWorkspaceSnapshot = {
  sessionPhase: WorkspaceSessionPhase
  pendingReplyId: string | null
  pendingParsed: ParsedResponse | null
  pendingRaw: string | null
  executivePayload: ParsedResponse | null
  executiveFallbackText: string | null
}

export type CopilotSessionSnapshot = {
  version: 1
  messages: SerializableMessage[]
  workspace: CopilotWorkspaceSnapshot
}

function emptyWorkspace(): CopilotWorkspaceSnapshot {
  return {
    sessionPhase: "fresh",
    pendingReplyId: null,
    pendingParsed: null,
    pendingRaw: null,
    executivePayload: null,
    executiveFallbackText: null,
  }
}

function emptySession(): CopilotSessionSnapshot {
  return {
    version: 1,
    messages: [],
    workspace: emptyWorkspace(),
  }
}

export function loadCopilotSession(): CopilotSessionSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== "object") return null
    const rec = data as Record<string, unknown>
    if (rec.version !== 1 || !rec.workspace || typeof rec.workspace !== "object") return null
    const ws = rec.workspace as Record<string, unknown>
    return {
      version: 1,
      messages: Array.isArray(rec.messages) ? (rec.messages as SerializableMessage[]) : [],
      workspace: {
        sessionPhase:
          ws.sessionPhase === "awaiting_continue" || ws.sessionPhase === "revealed" || ws.sessionPhase === "fresh"
            ? ws.sessionPhase
            : "fresh",
        pendingReplyId: typeof ws.pendingReplyId === "string" ? ws.pendingReplyId : null,
        pendingParsed: (ws.pendingParsed ?? null) as ParsedResponse | null,
        pendingRaw: typeof ws.pendingRaw === "string" ? ws.pendingRaw : ws.pendingRaw === null ? null : null,
        executivePayload: (ws.executivePayload ?? null) as ParsedResponse | null,
        executiveFallbackText:
          typeof ws.executiveFallbackText === "string"
            ? ws.executiveFallbackText
            : ws.executiveFallbackText === null
              ? null
              : null,
      },
    }
  } catch {
    return null
  }
}

/** Merges with any existing session so chat + workspace saves do not clobber each other. */
export function saveCopilotSession(partial: {
  messages?: SerializableMessage[]
  workspace?: Partial<CopilotWorkspaceSnapshot>
}): void {
  if (typeof window === "undefined") return
  try {
    const prev = loadCopilotSession()
    const base = prev ?? emptySession()
    const next: CopilotSessionSnapshot = {
      version: 1,
      messages: partial.messages ?? base.messages,
      workspace: {
        ...base.workspace,
        ...(partial.workspace ?? {}),
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota or private mode — ignore
  }
}

export function clearCopilotSession(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function messagesToSerializable(
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    isError?: boolean
    parsedResponse?: ParsedResponse | null
  }>
): SerializableMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp.toISOString(),
    isError: m.isError,
    parsedResponse: m.parsedResponse ?? null,
  }))
}
