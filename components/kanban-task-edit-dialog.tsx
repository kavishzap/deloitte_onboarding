"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { KanbanColumn, KanbanTask } from "@/lib/kanban-planning-types"

function splitList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseOptionalInt(raw: string): number | undefined {
  const t = raw.trim()
  if (!t) return undefined
  const n = Number.parseInt(t, 10)
  return Number.isFinite(n) ? n : undefined
}

function parseOptionalFloat(raw: string): number | undefined {
  const t = raw.trim()
  if (!t) return undefined
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : undefined
}

type KanbanTaskEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: KanbanTask | null
  columns: KanbanColumn[]
  onSave: (task: KanbanTask) => void
}

export function KanbanTaskEditDialog({ open, onOpenChange, task, columns, onSave }: KanbanTaskEditDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [columnId, setColumnId] = useState("")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("")
  const [epic, setEpic] = useState("")
  const [module, setModule] = useState("")
  const [feature, setFeature] = useState("")
  const [estimatedHours, setEstimatedHours] = useState("")
  const [storyPoints, setStoryPoints] = useState("")
  const [assignedEmployeeId, setAssignedEmployeeId] = useState("")
  const [assignedEmployeeName, setAssignedEmployeeName] = useState("")
  const [assignedRole, setAssignedRole] = useState("")
  const [dependenciesRaw, setDependenciesRaw] = useState("")
  const [tagsRaw, setTagsRaw] = useState("")

  useEffect(() => {
    if (!open || !task) return
    setTitle(task.title)
    setDescription(task.description ?? "")
    setColumnId(task.columnId)
    setPriority(task.priority ?? "")
    setStatus(task.status ?? "")
    setEpic(task.epic ?? "")
    setModule(task.module ?? "")
    setFeature(task.feature ?? "")
    setEstimatedHours(task.estimatedHours != null ? String(task.estimatedHours) : "")
    setStoryPoints(task.storyPoints != null ? String(task.storyPoints) : "")
    setAssignedEmployeeId(task.assignedEmployeeId ?? "")
    setAssignedEmployeeName(task.assignedEmployeeName ?? "")
    setAssignedRole(task.assignedRole ?? "")
    setDependenciesRaw((task.dependencies ?? []).join(", "))
    setTagsRaw((task.tags ?? []).join(", "))
  }, [open, task])

  const handleSubmit = () => {
    if (!task) return
    const t = title.trim()
    if (!t) return

    const next: KanbanTask = {
      taskId: task.taskId,
      title: t,
      description: description.trim(),
      columnId: columnId || task.columnId,
      priority: priority.trim() || undefined,
      status: status.trim() || undefined,
      epic: epic.trim() || undefined,
      module: module.trim() || undefined,
      feature: feature.trim() || undefined,
      estimatedHours: parseOptionalFloat(estimatedHours),
      storyPoints: parseOptionalInt(storyPoints),
      assignedEmployeeId: assignedEmployeeId.trim() || undefined,
      assignedEmployeeName: assignedEmployeeName.trim() || undefined,
      assignedRole: assignedRole.trim() || undefined,
      dependencies: splitList(dependenciesRaw),
      tags: splitList(tagsRaw),
    }
    onSave(next)
    onOpenChange(false)
  }

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b border-border/50 px-6 py-4 text-left">
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update fields below. Drag the grip handle on the board to move tasks between columns, or change the column
            here.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kanban-task-id">Task ID</Label>
              <Input id="kanban-task-id" value={task?.taskId ?? ""} readOnly disabled className="font-mono text-xs" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kanban-task-title">Title</Label>
              <Input id="kanban-task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kanban-task-desc">Description</Label>
              <Textarea
                id="kanban-task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-y"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Column</Label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {sortedColumns.map((c) => (
                    <SelectItem key={c.columnId} value={c.columnId}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-priority">Priority</Label>
              <Input
                id="kanban-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="e.g. High, Medium, Low"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-status">Status</Label>
              <Input id="kanban-task-status" value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-epic">Epic</Label>
              <Input id="kanban-task-epic" value={epic} onChange={(e) => setEpic(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-module">Module</Label>
              <Input id="kanban-task-module" value={module} onChange={(e) => setModule(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-feature">Feature</Label>
              <Input id="kanban-task-feature" value={feature} onChange={(e) => setFeature(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-hours">Estimated hours</Label>
              <Input
                id="kanban-task-hours"
                type="text"
                inputMode="decimal"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="e.g. 8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-points">Story points</Label>
              <Input
                id="kanban-task-points"
                type="text"
                inputMode="numeric"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-emp-id">Assignee ID</Label>
              <Input
                id="kanban-task-emp-id"
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-task-emp-name">Assignee name</Label>
              <Input
                id="kanban-task-emp-name"
                value={assignedEmployeeName}
                onChange={(e) => setAssignedEmployeeName(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kanban-task-role">Assignee role</Label>
              <Input id="kanban-task-role" value={assignedRole} onChange={(e) => setAssignedRole(e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kanban-task-deps">Dependencies (comma-separated task IDs)</Label>
              <Input
                id="kanban-task-deps"
                value={dependenciesRaw}
                onChange={(e) => setDependenciesRaw(e.target.value)}
                placeholder="task-1, task-2"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kanban-task-tags">Tags (comma-separated)</Label>
              <Input id="kanban-task-tags" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/50 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!title.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
