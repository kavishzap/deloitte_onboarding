/** Structured fields returned from n8n when the workflow emits JSON the UI understands. */
export interface ParsedResponse {
  executiveSummary?: string
  keyRecommendations?: string[]
  expectedBusinessValue?: string
  nextSteps?: string[]
  [key: string]: unknown
}
