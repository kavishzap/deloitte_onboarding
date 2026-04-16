export type SoftwareProposalPayload = {
  proposalTitle: string
  clientProblem: string
  solutionOverview: string
  proposedModules: string[]
  implementationPlan: string[]
  expectedOutcomes: string[]
}

/** Application / suite proposal shape from the business-proposal webhook. */
export type AppSuiteProposalPayload = {
  appName: string
  appDescription: string
  problemStatement: string
  solutionOverview: string
  coreFeatures: string[]
  advancedFeatures: string[]
  userRoles: string[]
  systemModules: string[]
  implementationPlan: string[]
  expectedOutcomes: string[]
}

export type ParsedProposalUnion =
  | { kind: "app-suite"; payload: AppSuiteProposalPayload }
  | { kind: "classic"; payload: SoftwareProposalPayload }

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string")
}

function tryParseRecord(o: Record<string, unknown>): SoftwareProposalPayload | null {
  if (typeof o.proposalTitle !== "string" || !o.proposalTitle.trim()) return null
  if (typeof o.clientProblem !== "string") return null
  if (typeof o.solutionOverview !== "string") return null
  return {
    proposalTitle: o.proposalTitle.trim(),
    clientProblem: o.clientProblem,
    solutionOverview: o.solutionOverview,
    proposedModules: asStringArray(o.proposedModules),
    implementationPlan: asStringArray(o.implementationPlan),
    expectedOutcomes: asStringArray(o.expectedOutcomes),
  }
}

/** Accepts top-level proposal JSON or one nested object (e.g. `output`). */
export function parseSoftwareProposal(data: unknown): SoftwareProposalPayload | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null
  const root = data as Record<string, unknown>
  const direct = tryParseRecord(root)
  if (direct) return direct
  for (const v of Object.values(root)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = tryParseRecord(v as Record<string, unknown>)
      if (nested) return nested
    }
  }
  return null
}

function tryParseAppSuiteRecord(o: Record<string, unknown>): AppSuiteProposalPayload | null {
  if (typeof o.appName !== "string" || !o.appName.trim()) return null
  return {
    appName: o.appName.trim(),
    appDescription: typeof o.appDescription === "string" ? o.appDescription : "",
    problemStatement: typeof o.problemStatement === "string" ? o.problemStatement : "",
    solutionOverview: typeof o.solutionOverview === "string" ? o.solutionOverview : "",
    coreFeatures: asStringArray(o.coreFeatures),
    advancedFeatures: asStringArray(o.advancedFeatures),
    userRoles: asStringArray(o.userRoles),
    systemModules: asStringArray(o.systemModules),
    implementationPlan: asStringArray(o.implementationPlan),
    expectedOutcomes: asStringArray(o.expectedOutcomes),
  }
}

export function parseAppSuiteProposal(data: unknown): AppSuiteProposalPayload | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null
  const root = data as Record<string, unknown>
  const direct = tryParseAppSuiteRecord(root)
  if (direct) return direct
  for (const v of Object.values(root)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = tryParseAppSuiteRecord(v as Record<string, unknown>)
      if (nested) return nested
    }
  }
  return null
}

/** Prefer app-suite (`appName` …) then classic (`proposalTitle` …). */
export function parseStructuredProposal(data: unknown): ParsedProposalUnion | null {
  const suite = parseAppSuiteProposal(data)
  if (suite) return { kind: "app-suite", payload: suite }
  const classic = parseSoftwareProposal(data)
  if (classic) return { kind: "classic", payload: classic }
  return null
}
