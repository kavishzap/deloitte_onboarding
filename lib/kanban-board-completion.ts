import type { KanbanBoardPayload, KanbanColumn } from "@/lib/kanban-planning-types"

const DONE_TITLE_RE = /\b(done|completed|closed|shipped|live)\b/i
const DONE_ID_RE = /\b(done|complete|closed)\b/i

/** Column treated as “completed” for progress: explicit Done-like title/id, else the rightmost column by `order`. */
export function getDoneColumn(columns: KanbanColumn[]): KanbanColumn | null {
  if (columns.length === 0) return null
  const sorted = [...columns].sort((a, b) => a.order - b.order)
  const named =
    sorted.find((c) => DONE_TITLE_RE.test(c.title) || DONE_ID_RE.test(c.columnId)) ?? null
  return named ?? sorted[sorted.length - 1]!
}

export type KanbanCompletionStats = {
  doneColumn: KanbanColumn | null
  totalTasks: number
  completedTasks: number
  remainingTasks: number
  percentComplete: number
}

export function getKanbanCompletionStats(board: KanbanBoardPayload): KanbanCompletionStats {
  const doneColumn = getDoneColumn(board.columns)
  const totalTasks = board.tasks.length
  const completedTasks = doneColumn
    ? board.tasks.filter((t) => t.columnId === doneColumn.columnId).length
    : 0
  const remainingTasks = Math.max(0, totalTasks - completedTasks)
  const percentComplete =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return {
    doneColumn,
    totalTasks,
    completedTasks,
    remainingTasks,
    percentComplete,
  }
}
