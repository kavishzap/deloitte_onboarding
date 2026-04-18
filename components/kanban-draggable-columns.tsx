"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { KanbanTaskEditDialog } from "@/components/kanban-task-edit-dialog"
import { cn } from "@/lib/utils"
import type { KanbanBoardPayload, KanbanTask } from "@/lib/kanban-planning-types"

function buildColumnTaskIds(board: KanbanBoardPayload): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const c of board.columns) {
    out[c.columnId] = []
  }
  for (const t of board.tasks) {
    if (!out[t.columnId]) out[t.columnId] = []
    out[t.columnId].push(t.taskId)
  }
  return out
}

function mergeBoardWithColumnOrder(
  board: KanbanBoardPayload,
  columnTaskIds: Record<string, string[]>
): KanbanBoardPayload {
  const taskById = new Map(board.tasks.map((t) => [t.taskId, { ...t }]))
  const next: KanbanTask[] = []
  const seen = new Set<string>()
  for (const c of [...board.columns].sort((a, b) => a.order - b.order)) {
    const ids = columnTaskIds[c.columnId] ?? []
    for (const id of ids) {
      const t = taskById.get(id)
      if (t) {
        next.push({ ...t, columnId: c.columnId })
        seen.add(id)
      }
    }
  }
  for (const t of board.tasks) {
    if (!seen.has(t.taskId)) next.push(t)
  }
  return { ...board, tasks: next }
}

function findContainer(
  id: UniqueIdentifier,
  columnTaskIds: Record<string, string[]>
): string | undefined {
  const s = String(id)
  if (Object.prototype.hasOwnProperty.call(columnTaskIds, s)) return s
  for (const [colId, ids] of Object.entries(columnTaskIds)) {
    if (ids.includes(s)) return colId
  }
  return undefined
}

function priorityClass(priority?: string) {
  const p = (priority ?? "").toLowerCase()
  if (p === "high")
    return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (p === "medium")
    return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
  if (p === "low") return "border-border bg-muted text-muted-foreground"
  return "border-border/60 bg-secondary/60 text-secondary-foreground"
}

function TaskCard({ task }: { task: KanbanTask }) {
  return (
    <div
      role="article"
      className="rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
      data-task-id={task.taskId}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug text-foreground">{task.title}</h4>
        {task.priority ? (
          <Badge variant="outline" className={cn("shrink-0 text-[10px] font-medium uppercase", priorityClass(task.priority))}>
            {task.priority}
          </Badge>
        ) : null}
      </div>
      {task.description ? (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{task.description}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
        {task.epic ? <span className="rounded bg-secondary px-1.5 py-0.5">{task.epic}</span> : null}
        {task.module ? <span className="rounded bg-secondary px-1.5 py-0.5">{task.module}</span> : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
        {task.assignedEmployeeName ? (
          <span className="flex items-center gap-1 font-medium text-foreground/90">
            <User className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            {task.assignedEmployeeName}
            {task.assignedRole ? <span className="font-normal text-muted-foreground">· {task.assignedRole}</span> : null}
          </span>
        ) : null}
        {task.storyPoints != null ? (
          <span className="rounded-full border border-border/60 px-2 py-0.5">{task.storyPoints} pts</span>
        ) : null}
        {task.estimatedHours != null ? <span>{task.estimatedHours}h</span> : null}
      </div>
      {task.dependencies && task.dependencies.length > 0 ? (
        <p className="mt-1.5 text-[10px] text-muted-foreground">Depends on: {task.dependencies.join(", ")}</p>
      ) : null}
      {task.tags && task.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SortableTaskRow({ task, onSelect }: { task: KanbanTask; onSelect: (task: KanbanTask) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn("touch-none", isDragging && "z-10")}>
      <div className="flex gap-1.5">
        <button
          type="button"
          className="mt-1 flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md border border-border/50 bg-muted/40 text-muted-foreground active:cursor-grabbing"
          aria-label={`Drag ${task.title}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <div
            role="button"
            tabIndex={0}
            className="w-full cursor-pointer rounded-xl text-left outline-none ring-offset-background transition-shadow hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onSelect(task)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(task)
              }
            }}
          >
            <TaskCard task={task} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ColumnDropArea({
  columnId,
  isEmpty,
  children,
}: {
  columnId: string
  isEmpty: boolean
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex max-h-[min(70vh,36rem)] min-h-[4rem] flex-col gap-3 overflow-y-auto p-3 sm:p-4",
        isOver && "rounded-lg bg-primary/5 ring-2 ring-primary/25 ring-offset-2 ring-offset-transparent"
      )}
    >
      {isEmpty ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>
      ) : null}
      {children}
    </div>
  )
}

type KanbanDraggableColumnsProps = {
  board: KanbanBoardPayload
  onBoardReorder: (next: KanbanBoardPayload) => void
}

export function KanbanDraggableColumns({ board, onBoardReorder }: KanbanDraggableColumnsProps) {
  const [columnTaskIds, setColumnTaskIds] = useState<Record<string, string[]>>(() => buildColumnTaskIds(board))
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null)
  const boardRef = useRef(board)
  boardRef.current = board

  useEffect(() => {
    setColumnTaskIds(buildColumnTaskIds(board))
  }, [board])

  const taskById = useMemo(() => {
    const m = new Map<string, KanbanTask>()
    for (const t of board.tasks) m.set(t.taskId, t)
    return m
  }, [board.tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const flush = useCallback((ids: Record<string, string[]>) => {
    onBoardReorder(mergeBoardWithColumnOrder(boardRef.current, ids))
  }, [onBoardReorder])

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    const overId = over?.id
    if (overId == null) return

    setColumnTaskIds((items) => {
      const overContainer = findContainer(overId, items)
      const activeContainer = findContainer(active.id, items)
      if (!overContainer || !activeContainer || activeContainer === overContainer) {
        return items
      }

      const activeItems = [...items[activeContainer]]
      const overItems = [...items[overContainer]]
      const activeIndex = activeItems.indexOf(String(active.id))
      if (activeIndex < 0) return items

      const overIndex = overItems.indexOf(String(overId))
      let newIndex: number
      if (Object.prototype.hasOwnProperty.call(items, String(overId))) {
        newIndex = overItems.length
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length
      }

      const nextActive = activeItems.filter((id) => id !== String(active.id))
      const moved = activeItems[activeIndex]!
      const nextOver = [...overItems.slice(0, newIndex), moved, ...overItems.slice(newIndex)]

      return {
        ...items,
        [activeContainer]: nextActive,
        [overContainer]: nextOver,
      }
    })
  }, [])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      setColumnTaskIds((current) => {
        if (!over) {
          queueMicrotask(() => flush(current))
          return current
        }

        const activeContainer = findContainer(active.id, current)
        const overContainer = findContainer(over.id, current)

        if (activeContainer && overContainer && activeContainer === overContainer) {
          const list = [...(current[activeContainer] ?? [])]
          const activeIndex = list.indexOf(String(active.id))
          const overIndex = list.indexOf(String(over.id))
          if (activeIndex >= 0 && overIndex >= 0 && activeIndex !== overIndex) {
            const next = { ...current, [activeContainer]: arrayMove(list, activeIndex, overIndex) }
            queueMicrotask(() => flush(next))
            return next
          }
        }

        queueMicrotask(() => flush(current))
        return current
      })
    },
    [flush]
  )

  const onDragCancel = useCallback(() => {
    setActiveId(null)
    setColumnTaskIds(buildColumnTaskIds(boardRef.current))
  }, [])

  const handleTaskSave = useCallback(
    (edited: KanbanTask) => {
      const b = boardRef.current
      const prev = b.tasks.find((t) => t.taskId === edited.taskId)
      if (!prev) return

      setColumnTaskIds((current) => {
        const next: Record<string, string[]> = {}
        for (const c of b.columns) {
          next[c.columnId] = [...(current[c.columnId] ?? [])]
        }
        if (prev.columnId !== edited.columnId) {
          for (const k of Object.keys(next)) {
            next[k] = next[k].filter((id) => id !== edited.taskId)
          }
          if (!next[edited.columnId]) next[edited.columnId] = []
          next[edited.columnId] = [...next[edited.columnId], edited.taskId]
        }

        const nextTasks = b.tasks.map((t) => (t.taskId === edited.taskId ? edited : t))
        const merged = mergeBoardWithColumnOrder({ ...b, tasks: nextTasks }, next)
        queueMicrotask(() => onBoardReorder(merged))
        return next
      })
      setEditingTask(null)
    },
    [onBoardReorder]
  )

  const activeTask = activeId ? taskById.get(String(activeId)) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="-mx-1 overflow-x-auto px-1 pb-2 text-center">
        <div className="inline-flex gap-4 pb-4 text-left">
            {board.columns.map((col) => {
              const ids = columnTaskIds[col.columnId] ?? []
              const isEmpty = ids.length === 0
              return (
                <div
                  key={col.columnId}
                  className="flex w-[min(100vw-2rem,20rem)] shrink-0 flex-col rounded-2xl border border-border/50 bg-muted/30 shadow-inner sm:w-[22rem]"
                >
                  <div className="border-b border-border/40 bg-muted/50 px-3 py-3 sm:px-4">
                    <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                    <p className="text-xs text-muted-foreground">{ids.length} tasks</p>
                  </div>
                  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    <ColumnDropArea columnId={col.columnId} isEmpty={isEmpty}>
                      {!isEmpty
                        ? ids.map((taskId) => {
                            const task = taskById.get(taskId)
                            if (!task) return null
                            return <SortableTaskRow key={taskId} task={task} onSelect={setEditingTask} />
                          })
                        : null}
                    </ColumnDropArea>
                  </SortableContext>
                </div>
              )
            })}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeTask ? (
          <div className="w-[min(100vw-2rem,20rem)] cursor-grabbing opacity-95 shadow-lg">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>

      <KanbanTaskEditDialog
        open={editingTask !== null}
        onOpenChange={(next) => {
          if (!next) setEditingTask(null)
        }}
        task={editingTask}
        columns={board.columns}
        onSave={handleTaskSave}
      />
    </DndContext>
  )
}
