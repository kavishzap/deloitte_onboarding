"use client"

import { useCallback, useMemo, useState } from "react"
import { AlertCircle, FolderGit2, LayoutGrid, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { KanbanDraggableColumns } from "@/components/kanban-draggable-columns"
import { useSoftwareProposal } from "@/components/software-proposal-context"
import { removeReviewColumnFromBoard, type KanbanBoardPayload } from "@/lib/kanban-planning-types"
import { toRepositoryPreviewSrcDoc } from "@/lib/repository-preview-srcdoc"
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

  const displayBoard = useMemo(() => removeReviewColumnFromBoard(board), [board])

  const repositorySrcDoc = useMemo(
    () => (repositoryHtml ? toRepositoryPreviewSrcDoc(repositoryHtml) : ""),
    [repositoryHtml]
  )

  const generateRepositoryPreview = useCallback(async () => {
    setRepoError(null)
    setRepoLoading(true)
    try {
      const parsed = parseStructuredProposal(proposalResult)
      const projectSummary = buildProjectSummaryText(parsed, displayBoard)
      const res = await fetch(PROJECT_HTML_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSummary,
          proposalResponse: proposalResult,
          planningBoard: displayBoard,
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
  }, [displayBoard, proposalResult, setRepositoryHtml])

  return (
    <section
      id={PLANNING_KANBAN_SECTION_ID}
      className="scroll-mt-24 mt-12 w-full border-t border-border/50 bg-gradient-to-b from-background to-muted/20 pb-12 pt-10 sm:mt-16 sm:pb-16 sm:pt-14"
      aria-labelledby="planning-kanban-title"
    >
      <div className="mx-auto w-full max-w-[min(100vw-1.5rem,120rem)] px-3 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 flex w-full max-w-6xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8 lg:gap-10">
          <div className="min-w-0 max-w-3xl flex-1 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Planning board</p>
            <h2
              id="planning-kanban-title"
              className="mt-1 flex flex-wrap items-center justify-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              <LayoutGrid className="h-7 w-7 shrink-0 text-primary" aria-hidden />
              {displayBoard.boardTitle}
            </h2>
            {displayBoard.boardDescription ? (
              <p className="mx-auto mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {displayBoard.boardDescription}
              </p>
            ) : null}
          </div>
          <div className="flex w-full shrink-0 justify-center sm:w-auto">
            <Button
              type="button"
              size="lg"
              className="w-full min-w-[min(100%,16rem)] gap-2 px-6 sm:w-auto sm:min-w-[12rem] sm:px-8"
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
        </header>

        <KanbanDraggableColumns board={displayBoard} onBoardReorder={setPlanningBoard} />

        <KanbanCompletionPie board={displayBoard} />

        {displayBoard.teamAllocation.length > 0 ? (
          <>
            <Separator className="my-10 bg-border/40" />
            <div>
              <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-foreground">
                Team allocation
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayBoard.teamAllocation.map((member) => (
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
                    Shown inside a sandboxed iframe so agent CSS and layout cannot override this app. Scripts inside
                    the preview are restricted by the iframe sandbox.
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/20">
                    <iframe
                      title="Generated repository HTML preview"
                      className="block h-[min(80vh,48rem)] w-full bg-background"
                      srcDoc={repositorySrcDoc}
                      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
