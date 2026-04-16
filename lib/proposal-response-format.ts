import type { ParsedResponse } from "@/lib/copilot-response-types"

/** True when the webhook JSON looks like the copilot executive shape (or a single nested payload). */
export function extractExecutiveLikePayload(data: unknown): ParsedResponse | null {
  if (!data || typeof data !== "object") return null
  const root = data as Record<string, unknown>

  const tryNode = (o: Record<string, unknown>): ParsedResponse | null => {
    const has =
      (typeof o.executiveSummary === "string" && o.executiveSummary.trim()) ||
      (Array.isArray(o.keyRecommendations) && o.keyRecommendations.length > 0) ||
      (typeof o.expectedBusinessValue === "string" && o.expectedBusinessValue.trim()) ||
      (Array.isArray(o.nextSteps) && o.nextSteps.length > 0)
    if (has) return o as ParsedResponse
    return null
  }

  const direct = tryNode(root)
  if (direct) return direct

  for (const v of Object.values(root)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = tryNode(v as Record<string, unknown>)
      if (nested) return nested
    }
  }

  return null
}
