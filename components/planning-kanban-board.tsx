"use client"

import { LayoutGrid, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { KanbanBoardPayload, KanbanTask } from "@/lib/kanban-planning-types"

export const PLANNING_KANBAN_SECTION_ID = "planning-kanban-section"

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
    <article
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
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Depends on: {task.dependencies.join(", ")}
        </p>
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
    </article>
  )
}

type PlanningKanbanBoardProps = {
  board: KanbanBoardPayload
}

export function PlanningKanbanBoard({ board }: PlanningKanbanBoardProps) {
  const tasksByColumn = new Map<string, KanbanTask[]>()
  for (const col of board.columns) {
    tasksByColumn.set(
      col.columnId,
      board.tasks.filter((t) => t.columnId === col.columnId)
    )
  }

  return (
    <section
      id={PLANNING_KANBAN_SECTION_ID}
      className="scroll-mt-24 mt-12 w-full border-t border-border/50 bg-gradient-to-b from-background to-muted/20 pb-12 pt-10 sm:mt-16 sm:pb-16 sm:pt-14"
      aria-labelledby="planning-kanban-title"
    >
      <div className="mx-auto w-full max-w-[min(100vw-1.5rem,120rem)] px-3 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Planning board</p>
          <h2
            id="planning-kanban-title"
            className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            <LayoutGrid className="h-7 w-7 shrink-0 text-primary" aria-hidden />
            {board.boardTitle}
          </h2>
          {board.boardDescription ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{board.boardDescription}</p>
          ) : null}
        </header>

        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex w-max min-w-full gap-4 pb-4">
            {board.columns.map((col) => {
              const colTasks = tasksByColumn.get(col.columnId) ?? []
              return (
                <div
                  key={col.columnId}
                  className="flex w-[min(100vw-2rem,20rem)] shrink-0 flex-col rounded-2xl border border-border/50 bg-muted/30 shadow-inner sm:w-[22rem]"
                >
                  <div className="border-b border-border/40 bg-muted/50 px-3 py-3 sm:px-4">
                    <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                    <p className="text-xs text-muted-foreground">{colTasks.length} tasks</p>
                  </div>
                  <div className="flex max-h-[min(70vh,36rem)] flex-col gap-3 overflow-y-auto p-3 sm:p-4">
                    {colTasks.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>
                    ) : (
                      colTasks.map((task) => <TaskCard key={task.taskId} task={task} />)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {board.teamAllocation.length > 0 ? (
          <>
            <Separator className="my-10 bg-border/40" />
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Team allocation</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {board.teamAllocation.map((member) => (
                  <Card key={member.employeeId} className="border-border/50 bg-card shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{member.employeeName}</CardTitle>
                      <p className="text-xs font-medium text-muted-foreground">{member.role}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">{member.assignedTaskCount}</span> tasks ·{" "}
                        <span className="font-medium text-foreground">{member.totalAllocatedHours}h</span> allocated ·{" "}
                        <span className="font-medium text-foreground">{member.availableHoursPerWeek}h</span>/wk cap ·{" "}
                        <span className="font-medium text-foreground">{member.availabilityPercent}%</span> availability
                      </p>
                      {member.utilizationNote ? (
                        <p className="leading-relaxed text-foreground/80">{member.utilizationNote}</p>
                      ) : null}
                      <p className="font-mono text-[10px] text-muted-foreground/90">
                        {member.assignedTaskIds.join(", ")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
