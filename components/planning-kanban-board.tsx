"use client"

import { useCallback, useState } from "react"
import { AlertCircle, FolderGit2, LayoutGrid, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { KanbanDraggableColumns } from "@/components/kanban-draggable-columns"
import { useSoftwareProposal } from "@/components/software-proposal-context"
import type { KanbanBoardPayload } from "@/lib/kanban-planning-types"
import { cn } from "@/lib/utils"
import { buildProjectSummaryText } from "@/lib/project-html-agent"
import { parseStructuredProposal } from "@/lib/software-proposal-types"
import { KanbanCompletionPie } from "@/components/kanban-completion-pie"

export const PLANNING_KANBAN_SECTION_ID = "planning-kanban-section"
export const REPOSITORY_HTML_PREVIEW_ID = "repository-html-preview"

const PROJECT_HTML_API = "/api/n8n/project-html"

type PlanningKanbanBoardProps = {
  board: KanbanBoardPayload
}

export function PlanningKanbanBoard({ board }: PlanningKanbanBoardProps) {
  const { proposalResult, repositoryHtml, setRepositoryHtml, setPlanningBoard } = useSoftwareProposal()
  const [repoLoading, setRepoLoading] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)

  const generateRepositoryPreview = useCallback(async () => {
    setRepoError(null)
    setRepoLoading(true)
    try {
      const parsed = parseStructuredProposal(proposalResult)
      const projectSummary = buildProjectSummaryText(parsed, board)
      const res = await fetch(PROJECT_HTML_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSummary,
          proposalResponse: proposalResult,
          planningBoard: board,
        }),
      })
      const responseText = await res.text()
      let data = {} as {
        html?: string
        error?: string
        message?: string
        hint?: string
        detail?: unknown
      }
      try {
        if (responseText.trim()) {
          data = JSON.parse(responseText) as typeof data
        }
      } catch {
        if (!res.ok) {
          throw new Error(responseText.trim().slice(0, 240) || `Upstream returned ${res.status}`)
        }
        throw new Error("Invalid JSON from HTML agent")
      }
      if (!res.ok) {
        const fromN8n =
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : null
        const msg = fromN8n ?? `Upstream returned ${res.status}`
        throw new Error(typeof data.hint === "string" ? `${msg} ${data.hint}` : msg)
      }
      const html = typeof data.html === "string" ? data.html : ""
      if (!html.trim()) {
        throw new Error("Empty HTML in response")
      }
      setRepositoryHtml(html)
      toast.success("Repository preview ready", {
        description: "HTML from your n8n agent is shown below.",
      })
      requestAnimationFrame(() => {
        document.getElementById(REPOSITORY_HTML_PREVIEW_ID)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not generate HTML"
      setRepoError(message)
      toast.error("HTML agent failed", { description: message })
    } finally {
      setRepoLoading(false)
    }
  }, [board, proposalResult, setRepositoryHtml])

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

        <KanbanDraggableColumns board={board} onBoardReorder={setPlanningBoard} />

        <KanbanCompletionPie board={board} />

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

        <div className="mt-12 flex justify-center border-t border-border/40 pt-10">
          <Button
            type="button"
            size="lg"
            className="min-w-[min(100%,20rem)] gap-2 px-8"
            disabled={repoLoading}
            onClick={() => void generateRepositoryPreview()}
          >
            {repoLoading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
            ) : (
              <FolderGit2 className="h-5 w-5 shrink-0" aria-hidden />
            )}
            Generate Code repository
          </Button>
        </div>

        {(repoLoading || repoError || repositoryHtml) && (
          <div
            id={REPOSITORY_HTML_PREVIEW_ID}
            className="scroll-mt-24 mt-10 border-t border-border/40 pt-10"
          >
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-foreground">
              Repository preview (HTML agent)
            </h3>
            {repoLoading ? (
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                Generating base code repository preview…
              </p>
            ) : null}
            {repoError && !repoLoading ? (
              <Alert variant="destructive" className="mx-auto max-w-2xl">
                <AlertCircle className="h-4 w-4" aria-hidden />
                <AlertTitle>Could not load HTML</AlertTitle>
                <AlertDescription>{repoError}</AlertDescription>
              </Alert>
            ) : null}
            {repositoryHtml && !repoLoading ? (
              <Card className="border-border/50 bg-card shadow-inner">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-foreground">Rendered output</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Generated HTML is injected below. Trusted agent output only — sanitize before production.
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div
                    className={cn(
                      "repo-html-preview max-h-[min(80vh,48rem)] overflow-auto rounded-xl border border-border/40 bg-muted/15 p-4 sm:p-6",
                      "[&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:text-sm",
                      "[&_a]:text-primary [&_a]:underline-offset-2"
                    )}
                    dangerouslySetInnerHTML={{ __html: repositoryHtml }}
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
