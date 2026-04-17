import type { KanbanBoardPayload } from "@/lib/kanban-planning-types"
import type { ParsedProposalUnion } from "@/lib/software-proposal-types"

function lines(label: string, items: string[]): string {
  if (items.length === 0) return ""
  return `${label}:\n${items.map((x) => `  - ${x}`).join("\n")}\n\n`
}

/** Plain-text brief for the HTML agent, from structured proposal + board context. */
export function buildProjectSummaryText(
  parsed: ParsedProposalUnion | null,
  board: KanbanBoardPayload
): string {
  const boardIntro = [
    `Planning board: ${board.boardTitle}`,
    board.boardDescription ? `Board description: ${board.boardDescription}` : "",
    `Columns: ${board.columns.map((c) => c.title).join(" → ")}`,
    `Tasks (${board.tasks.length}):`,
    ...board.tasks.map((t) => `  - [${t.columnId}] ${t.title}${t.description ? `: ${t.description.slice(0, 200)}` : ""}`),
  ]
    .filter(Boolean)
    .join("\n")

  if (!parsed) {
    return `${boardIntro}\n\n(Proposal JSON was not available; generate HTML from the planning board only.)`
  }

  if (parsed.kind === "classic") {
    const p = parsed.payload
    return [
      `Proposal: ${p.proposalTitle}`,
      "",
      `Client problem:\n${p.clientProblem}`,
      "",
      `Solution overview:\n${p.solutionOverview}`,
      "",
      lines("Proposed modules", p.proposedModules),
      lines("Implementation plan", p.implementationPlan),
      lines("Expected outcomes", p.expectedOutcomes),
      "---",
      boardIntro,
    ].join("\n")
  }

  const p = parsed.payload
  return [
    `Application: ${p.appName}`,
    "",
    `Description:\n${p.appDescription}`,
    "",
    `Problem:\n${p.problemStatement}`,
    "",
    `Solution overview:\n${p.solutionOverview}`,
    "",
    lines("Core features", p.coreFeatures),
    lines("Advanced features", p.advancedFeatures),
    lines("User roles", p.userRoles),
    lines("System modules", p.systemModules),
    lines("Implementation plan", p.implementationPlan),
    lines("Expected outcomes", p.expectedOutcomes),
    "---",
    boardIntro,
  ].join("\n")
}

function stripMarkdownFences(s: string): string {
  let t = s.trim()
  t = t.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "")
  return t.trim()
}

/** Normalize n8n / OpenAI responses to a single HTML fragment string. */
export function extractHtmlFromAgentResponse(payload: unknown): string | null {
  if (payload == null) return null

  if (typeof payload === "string") {
    const t = payload.trim()
    if (!t) return null
    if (t.startsWith("<")) return stripMarkdownFences(t)
    try {
      return extractHtmlFromAgentResponse(JSON.parse(t) as unknown)
    } catch {
      return null
    }
  }

  if (typeof payload === "object" && !Array.isArray(payload)) {
    const o = payload as Record<string, unknown>
    if (typeof o.html === "string" && o.html.trim()) {
      return stripMarkdownFences(o.html.trim())
    }
    if (typeof o.text === "string" && o.text.trim()) {
      return extractHtmlFromAgentResponse(o.text)
    }
    if (typeof o.response === "string" && o.response.trim()) {
      return extractHtmlFromAgentResponse(o.response)
    }
    if (o.output != null && typeof o.output === "object") {
      const inner = extractHtmlFromAgentResponse(o.output)
      if (inner) return inner
    }
    if (Array.isArray(o.data) && o.data.length > 0) {
      return extractHtmlFromAgentResponse(o.data[0])
    }
  }

  return null
}
