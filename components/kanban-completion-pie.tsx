"use client"

import { useMemo, useState } from "react"
import { Pie, PieChart } from "recharts"
import { Bell, Loader2, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { KanbanBoardPayload } from "@/lib/kanban-planning-types"
import { getKanbanCompletionStats } from "@/lib/kanban-board-completion"
import { KANBAN_NOTIFICATION_RECIPIENTS } from "@/lib/kanban-notification-recipients"
import { cn } from "@/lib/utils"

/** Called from the browser so the request appears in DevTools as this URL (not the Next.js API). */
const KANBAN_NOTIFICATION_N8N_WEBHOOK =
  process.env.NEXT_PUBLIC_N8N_KANBAN_NOTIFICATION_WEBHOOK_URL?.trim() ||
  "https://kavishmk.app.n8n.cloud/webhook-test/b06cf682-e51f-4e85-ba8e-10b339aef822"

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  remaining: {
    label: "Not in done column",
    color: "var(--muted)",
  },
} satisfies ChartConfig

type KanbanCompletionPieProps = {
  board: KanbanBoardPayload
}

export function KanbanCompletionPie({ board }: KanbanCompletionPieProps) {
  const stats = useMemo(() => getKanbanCompletionStats(board), [board])
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [selectedRecipientId, setSelectedRecipientId] = useState(
    () => KANBAN_NOTIFICATION_RECIPIENTS[0]?.id ?? ""
  )
  const [sendLoading, setSendLoading] = useState(false)

  const chartData = useMemo(() => {
    const { completedTasks, remainingTasks } = stats
    const rows: { type: keyof typeof chartConfig; value: number; fill: string }[] = []
    if (completedTasks > 0) {
      rows.push({
        type: "completed",
        value: completedTasks,
        fill: "var(--color-completed)",
      })
    }
    if (remainingTasks > 0) {
      rows.push({
        type: "remaining",
        value: remainingTasks,
        fill: "var(--color-remaining)",
      })
    }
    return rows
  }, [stats])

  const doneTitle = stats.doneColumn?.title ?? "Done"

  const openNotifyModal = () => {
    setSelectedRecipientId(KANBAN_NOTIFICATION_RECIPIENTS[0]?.id ?? "")
    setNotifyOpen(true)
  }

  const handleSendNotification = async () => {
    const recipient = KANBAN_NOTIFICATION_RECIPIENTS.find((r) => r.id === selectedRecipientId)
    if (!recipient) {
      toast.error("Choose a recipient", { description: "Select who should receive this email." })
      return
    }

    setSendLoading(true)
    try {
      const subject = `Planning board update: ${board.boardTitle}`
      const summaryLine = `Board “${board.boardTitle}” is ${stats.percentComplete}% complete (${stats.completedTasks}/${stats.totalTasks} tasks in “${doneTitle}”).`

      const n8nBody: Record<string, string | number> = {
        "Recipient Email": recipient.email,
        "Recipient Name": recipient.name,
        Subject: subject,
        "Board Title": board.boardTitle,
        "Percent Complete": stats.percentComplete,
        "Completed Tasks": stats.completedTasks,
        "Total Tasks": stats.totalTasks,
        "Done Column Title": doneTitle,
        "Summary Line": summaryLine,
      }

      const res = await fetch(KANBAN_NOTIFICATION_N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nBody),
      })

      const rawText = await res.text()
      let payload: unknown = rawText
      try {
        payload = rawText ? (JSON.parse(rawText) as unknown) : null
      } catch {
        payload = rawText
      }

      if (!res.ok) {
        const errMsg =
          typeof payload === "object" && payload !== null && "error" in payload
            ? String((payload as { error?: unknown }).error)
            : `Request failed (${res.status})`
        throw new Error(errMsg || `Request failed (${res.status})`)
      }

      let extra = ""
      if (typeof payload === "object" && payload !== null && "message" in payload) {
        const m = (payload as { message?: unknown }).message
        if (typeof m === "string" && m.trim()) extra = m.trim()
      }

      toast.success("Email sent successfully", {
        description: extra
          ? `${extra} — delivered to ${recipient.name} (${recipient.email}).`
          : `Your planning update was sent to ${recipient.name} (${recipient.email}).`,
      })
      setNotifyOpen(false)
    } catch (e) {
      toast.error("Could not send email", {
        description: e instanceof Error ? e.message : "The notification request failed.",
      })
    } finally {
      setSendLoading(false)
    }
  }

  return (
    <>
      <Card className="mt-10 border-border/50 bg-card shadow-lg shadow-black/5">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-lg font-semibold tracking-tight">Board completion</CardTitle>
          <CardDescription className="mx-auto max-w-md text-center">
            {stats.totalTasks === 0
              ? "No tasks on this board yet."
              : `“Completed” counts tasks in the “${doneTitle}” column (${stats.completedTasks} of ${stats.totalTasks} tasks).`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-2">
          {stats.totalTasks === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Add tasks to see completion breakdown.</p>
          ) : (
            <div className="flex w-full flex-col items-center gap-5">
              <div className="relative mx-auto h-[min(72vw,260px)] w-[min(72vw,260px)] shrink-0">
                <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="type" />}
                    />
                    <Pie
                      nameKey="type"
                      dataKey="value"
                      data={chartData}
                      innerRadius="58%"
                      outerRadius="88%"
                      paddingAngle={chartData.length > 1 ? 2 : 0}
                      stroke="var(--border)"
                      strokeWidth={1}
                    />
                  </PieChart>
                </ChartContainer>
                <div
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                  aria-hidden
                >
                  <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                    {stats.percentComplete}%
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    complete
                  </span>
                </div>
              </div>

              <ul className="mx-auto flex w-full max-w-md flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: "var(--color-completed)" }}
                      aria-hidden
                    />
                    {chartConfig.completed.label}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {stats.completedTasks}{" "}
                    <span className="text-muted-foreground">
                      ({stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%)
                    </span>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: "var(--color-remaining)" }}
                      aria-hidden
                    />
                    {chartConfig.remaining.label}
                  </span>
                  <span className="font-mono tabular-nums text-foreground">
                    {stats.remainingTasks}{" "}
                    <span className="text-muted-foreground">
                      ({stats.totalTasks ? Math.round((stats.remainingTasks / stats.totalTasks) * 100) : 0}%)
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          )}

          <Button type="button" className="mx-auto w-full max-w-sm sm:w-auto" onClick={openNotifyModal}>
            <Bell className="mr-2 h-4 w-4" aria-hidden />
            Send Email Notification
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={notifyOpen}
        onOpenChange={(open) => {
          if (!open && sendLoading) return
          setNotifyOpen(open)
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton={!sendLoading}>
          <DialogHeader className="border-b border-border/50 px-6 py-4 text-left">
            <DialogTitle>Send email notification</DialogTitle>
            <DialogDescription>
              Choose who receives a summary of this planning board. The message is sent through your connected
              workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[min(60vh,22rem)] overflow-y-auto px-6 py-4">
            <RadioGroup
              value={selectedRecipientId}
              onValueChange={setSelectedRecipientId}
              className="gap-2"
              disabled={sendLoading}
            >
              {KANBAN_NOTIFICATION_RECIPIENTS.map((person) => (
                <div key={person.id}>
                  <RadioGroupItem value={person.id} id={`notify-${person.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`notify-${person.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/35",
                      "peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-focus-visible:outline-none",
                      selectedRecipientId === person.id &&
                        "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background text-primary shadow-sm">
                      <User className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-semibold text-foreground">{person.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter className="gap-2 border-t border-border/50 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" disabled={sendLoading} onClick={() => setNotifyOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={sendLoading || !selectedRecipientId} onClick={() => void handleSendNotification()}>
              {sendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" aria-hidden />
                  Send email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
