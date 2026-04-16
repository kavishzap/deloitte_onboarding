export type KanbanColumn = {
  columnId: string
  title: string
  order: number
}

export type KanbanTask = {
  taskId: string
  title: string
  description: string
  epic?: string
  module?: string
  feature?: string
  priority?: string
  status?: string
  columnId: string
  estimatedHours?: number
  storyPoints?: number
  assignedEmployeeId?: string
  assignedEmployeeName?: string
  assignedRole?: string
  dependencies?: string[]
  tags?: string[]
}

export type TeamAllocationEntry = {
  employeeId: string
  employeeName: string
  role: string
  assignedTaskIds: string[]
  assignedTaskCount: number
  totalAllocatedHours: number
  availableHoursPerWeek: number
  availabilityPercent: number
  utilizationNote?: string
}

export type KanbanBoardPayload = {
  boardTitle: string
  boardDescription: string
  columns: KanbanColumn[]
  tasks: KanbanTask[]
  teamAllocation: TeamAllocationEntry[]
}

function parseColumns(raw: unknown): KanbanColumn[] {
  if (!Array.isArray(raw)) return []
  const out: KanbanColumn[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const c = item as Record<string, unknown>
    const columnId = typeof c.columnId === "string" ? c.columnId : ""
    const title = typeof c.title === "string" ? c.title : ""
    if (!columnId || !title) continue
    const order = typeof c.order === "number" ? c.order : Number(c.order) || 0
    out.push({ columnId, title, order })
  }
  return out.sort((a, b) => a.order - b.order)
}

function parseTasks(raw: unknown): KanbanTask[] {
  if (!Array.isArray(raw)) return []
  const out: KanbanTask[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const t = item as Record<string, unknown>
    const taskId = typeof t.taskId === "string" ? t.taskId : ""
    const title = typeof t.title === "string" ? t.title : ""
    const columnId = typeof t.columnId === "string" ? t.columnId : ""
    if (!taskId || !title || !columnId) continue
    const description = typeof t.description === "string" ? t.description : ""
    const deps = Array.isArray(t.dependencies)
      ? t.dependencies.filter((d): d is string => typeof d === "string")
      : []
    const tags = Array.isArray(t.tags) ? t.tags.filter((x): x is string => typeof x === "string") : []
    out.push({
      taskId,
      title,
      description,
      epic: typeof t.epic === "string" ? t.epic : undefined,
      module: typeof t.module === "string" ? t.module : undefined,
      feature: typeof t.feature === "string" ? t.feature : undefined,
      priority: typeof t.priority === "string" ? t.priority : undefined,
      status: typeof t.status === "string" ? t.status : undefined,
      columnId,
      estimatedHours: typeof t.estimatedHours === "number" ? t.estimatedHours : undefined,
      storyPoints: typeof t.storyPoints === "number" ? t.storyPoints : undefined,
      assignedEmployeeId: typeof t.assignedEmployeeId === "string" ? t.assignedEmployeeId : undefined,
      assignedEmployeeName: typeof t.assignedEmployeeName === "string" ? t.assignedEmployeeName : undefined,
      assignedRole: typeof t.assignedRole === "string" ? t.assignedRole : undefined,
      dependencies: deps,
      tags,
    })
  }
  return out
}

function parseTeamAllocation(raw: unknown): TeamAllocationEntry[] {
  if (!Array.isArray(raw)) return []
  const out: TeamAllocationEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const e = item as Record<string, unknown>
    const employeeId = typeof e.employeeId === "string" ? e.employeeId : ""
    const employeeName = typeof e.employeeName === "string" ? e.employeeName : ""
    if (!employeeId || !employeeName) continue
    const assignedTaskIds = Array.isArray(e.assignedTaskIds)
      ? e.assignedTaskIds.filter((x): x is string => typeof x === "string")
      : []
    out.push({
      employeeId,
      employeeName,
      role: typeof e.role === "string" ? e.role : "",
      assignedTaskIds,
      assignedTaskCount: typeof e.assignedTaskCount === "number" ? e.assignedTaskCount : assignedTaskIds.length,
      totalAllocatedHours: typeof e.totalAllocatedHours === "number" ? e.totalAllocatedHours : 0,
      availableHoursPerWeek: typeof e.availableHoursPerWeek === "number" ? e.availableHoursPerWeek : 0,
      availabilityPercent: typeof e.availabilityPercent === "number" ? e.availabilityPercent : 0,
      utilizationNote: typeof e.utilizationNote === "string" ? e.utilizationNote : undefined,
    })
  }
  return out
}

function tryParseKanbanRecord(o: Record<string, unknown>): KanbanBoardPayload | null {
  if (typeof o.boardTitle !== "string" || !o.boardTitle.trim()) return null
  const columns = parseColumns(o.columns)
  const tasks = parseTasks(o.tasks)
  if (columns.length === 0 || tasks.length === 0) return null
  return {
    boardTitle: o.boardTitle.trim(),
    boardDescription: typeof o.boardDescription === "string" ? o.boardDescription : "",
    columns,
    tasks,
    teamAllocation: parseTeamAllocation(o.teamAllocation),
  }
}

/** Planning webhook JSON (top-level or nested, e.g. `output`). */
export function parseKanbanBoardPayload(data: unknown): KanbanBoardPayload | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null
  const root = data as Record<string, unknown>
  const direct = tryParseKanbanRecord(root)
  if (direct) return direct
  for (const v of Object.values(root)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = tryParseKanbanRecord(v as Record<string, unknown>)
      if (nested) return nested
    }
  }
  return null
}
