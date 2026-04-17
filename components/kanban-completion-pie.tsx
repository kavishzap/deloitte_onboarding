"use client"

import { useMemo } from "react"
import { Pie, PieChart } from "recharts"
import { Bell } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { KanbanBoardPayload } from "@/lib/kanban-planning-types"
import { getKanbanCompletionStats } from "@/lib/kanban-board-completion"

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

  const handleNotify = () => {
    toast.success("Notification queued", {
      description: `Planning board “${board.boardTitle}” — ${stats.percentComplete}% complete (${stats.completedTasks}/${stats.totalTasks} tasks in “${doneTitle}”).`,
    })
  }

  return (
    <Card className="mt-10 border-border/50 bg-card shadow-lg shadow-black/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">Board completion</CardTitle>
        <CardDescription>
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

            <ul className="flex w-full max-w-md flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm">
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

        <Button type="button" className="w-full max-w-sm sm:w-auto" onClick={handleNotify}>
          <Bell className="mr-2 h-4 w-4" aria-hidden />
          Send notification
        </Button>
      </CardContent>
    </Card>
  )
}
