"use client"

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Boxes, FileDown, Layers, ListOrdered, Loader2, Sparkles, Target, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { AppSuiteProposalPayload, SoftwareProposalPayload } from "@/lib/software-proposal-types"
import { parseStructuredProposal } from "@/lib/software-proposal-types"
import { loadCopilotSession } from "@/lib/copilot-local-session"
import { parseKanbanBoardPayload } from "@/lib/kanban-planning-types"
import { useSoftwareProposal } from "@/components/software-proposal-context"
import { exportProposalToPdf } from "@/lib/export-proposal-pdf"
import { SOFTWARE_PROPOSAL_OUTPUT_SECTION_ID } from "@/lib/workspace-section-ids"
import { PipelineDialogLoader } from "@/components/pipeline-dialog-loader"
import { PLANNING_PIPELINE_STEPS } from "@/lib/planning-pipeline-steps"
import { toast } from "sonner"

const PLANNING_WEBHOOK_API = "/api/n8n/planning"

type PlanningUiPhase = "intro" | "working" | "done"

function PlanningApproachExplainer() {
  return (
    <div
      className="mt-4 max-h-[min(60vh,26rem)] space-y-5 overflow-y-auto pr-1 text-sm leading-relaxed text-foreground"
      role="region"
      aria-label="Planning approach overview"
    >
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">1. What this planning step does</h4>
        <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
          <li>
            <span className="text-foreground/95">Employee data and availability</span> — skills, roles, and capacity
            signals are read so work is only placed on people who can realistically take it on.
          </li>
          <li>
            <span className="text-foreground/95">Tasks from the proposal</span> — modules, milestones, and outcomes in
            your software proposal are decomposed into actionable tickets with clear owners in mind.
          </li>
          <li>
            <span className="text-foreground/95">Assignments</span> — each ticket is matched using role fit, skill
            coverage, and availability; gaps are flagged rather than silently overloaded.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">2. Inputs in use</h4>
        <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
          <li>
            <span className="text-foreground/95">Project proposal summary</span> — the structured proposal returned from
            the software application proposal step (scope, modules, plan, outcomes).
          </li>
          <li>
            <span className="text-foreground/95">Employee roster</span> — identifiers, roles, skills, and availability
            windows supplied by your planning workflow / n8n context (and your saved copilot session envelope where
            applicable).
          </li>
          <li>
            <span className="text-foreground/95">Assumptions when data is thin</span> — conservative defaults (e.g.
            standard capacity, role-only matching, unassigned swimlane) are applied and surfaced in notes so you can
            refine data before execution.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">3. Planned outputs</h4>
        <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
          <li>Task breakdown as discrete tickets with descriptions and dependencies.</li>
          <li>Suggested assignee per task (employee id/name and role where confidence allows).</li>
          <li>Estimated hours or duration bands and optional story points.</li>
          <li>Priority levels aligned to delivery risk and proposal emphasis.</li>
          <li>Phased timeline cues (e.g. discovery, build, hardening) mapped to columns or tags.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">4. Output format (Kanban-ready JSON)</h4>
        <p className="text-muted-foreground">
          The webhook returns a single JSON object the UI parses directly into a board. Top-level fields:
        </p>
        <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">boardTitle</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">boardDescription</code> — context for
            the programme.
          </li>
          <li>
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">columns[]</code> — each item has{" "}
            <code className="text-xs">columnId</code>, <code className="text-xs">title</code> (e.g. &ldquo;To
            Do&rdquo;, &ldquo;In Progress&rdquo;, &ldquo;Done&rdquo;), and <code className="text-xs">order</code>. Your
            board renders
            columns in sort order.
          </li>
          <li>
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">tasks[]</code> — each ticket includes{" "}
            <code className="text-xs">taskId</code>, <code className="text-xs">title</code>,{" "}
            <code className="text-xs">description</code>, <code className="text-xs">columnId</code>, optional{" "}
            <code className="text-xs">priority</code>, <code className="text-xs">estimatedHours</code>, assignee fields,
            dependencies, and tags.
          </li>
          <li>
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">teamAllocation[]</code> — optional
            rollup of hours, task ids, and utilization notes per employee for governance views.
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">5. Constraints and logic</h4>
        <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
          <li>
            <span className="text-foreground/95">Workload guardrails</span> — per-person caps informed by stated
            availability; work is shifted or left unassigned when a cap would be exceeded.
          </li>
          <li>
            <span className="text-foreground/95">Conflicts and overload</span> — contested slots are resolved by
            priority, then earliest free capacity; residual risk is annotated on the ticket or allocation summary.
          </li>
          <li>
            <span className="text-foreground/95">Priorities</span> — driven by proposal sequencing, dependency depth,
            and business impact tags embedded in the proposal text.
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-3 text-sm text-foreground">
        <p className="font-semibold leading-snug">6. Confirmation</p>
        <p className="mt-1.5 leading-relaxed text-foreground/90">
          Do you want to proceed with planning based on this approach? Choosing{" "}
          <span className="font-medium text-foreground">Yes — proceed with planning</span> will send your proposal and
          session context to the planning webhook to generate the board.
        </p>
      </div>
    </div>
  )
}

function ProposalBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h3>
      </div>
      <div className="pl-0 sm:pl-10">{children}</div>
    </div>
  )
}

function NumberedList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground">
            {i + 1}
          </span>
          <span className="min-w-0 pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <ul className="space-y-2 pl-1 text-sm leading-relaxed text-foreground/95 sm:text-base">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 pl-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function RoleChips({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((role) => (
        <span
          key={role}
          className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground"
        >
          {role}
        </span>
      ))}
    </div>
  )
}

function ModuleGrid({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((m, i) => (
        <li
          key={i}
          className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-sm font-medium text-foreground"
        >
          {m}
        </li>
      ))}
    </ul>
  )
}

function AppSuiteProposalBody({ app }: { app: AppSuiteProposalPayload }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-10 print:grid-cols-1">
      <header className="space-y-3 border-b border-border/40 pb-6 text-center lg:col-span-2">
        <h1 className="mx-auto max-w-4xl text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {app.appName}
        </h1>
        {app.appDescription ? (
          <p className="mx-auto max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {app.appDescription}
          </p>
        ) : null}
      </header>

      <ProposalBlock icon={Target} title="Problem statement">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">
          {app.problemStatement || "—"}
        </p>
      </ProposalBlock>

      <ProposalBlock icon={Layers} title="Solution overview">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">
          {app.solutionOverview || "—"}
        </p>
      </ProposalBlock>

      <ProposalBlock icon={ListOrdered} title="Core features">
        <NumberedList items={app.coreFeatures} />
      </ProposalBlock>

      <ProposalBlock icon={Sparkles} title="Advanced features">
        <BulletList items={app.advancedFeatures} />
      </ProposalBlock>

      <ProposalBlock icon={Users} title="User roles">
        <RoleChips items={app.userRoles} />
      </ProposalBlock>

      <ProposalBlock icon={Boxes} title="System modules">
        <ModuleGrid items={app.systemModules} />
      </ProposalBlock>

      <ProposalBlock icon={ListOrdered} title="Implementation plan">
        <NumberedList items={app.implementationPlan} />
      </ProposalBlock>

      <ProposalBlock icon={ListOrdered} title="Expected outcomes">
        <NumberedList items={app.expectedOutcomes} />
      </ProposalBlock>
    </div>
  )
}

function ProposalBody({ proposal }: { proposal: SoftwareProposalPayload }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-10 print:grid-cols-1">
      <h1 className="mx-auto max-w-4xl text-balance text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:col-span-2">
        {proposal.proposalTitle}
      </h1>

      <ProposalBlock icon={Target} title="Client problem">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">{proposal.clientProblem}</p>
      </ProposalBlock>

      <ProposalBlock icon={Layers} title="Solution overview">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">{proposal.solutionOverview}</p>
      </ProposalBlock>

      <ProposalBlock icon={ListOrdered} title="Proposed modules">
        <NumberedList items={proposal.proposedModules} />
      </ProposalBlock>

      <ProposalBlock icon={ListOrdered} title="Implementation plan">
        <NumberedList items={proposal.implementationPlan} />
      </ProposalBlock>

      <div className="lg:col-span-2">
        <ProposalBlock icon={ListOrdered} title="Expected outcomes">
          <NumberedList items={proposal.expectedOutcomes} />
        </ProposalBlock>
      </div>
    </div>
  )
}

type SoftwareProposalFullSectionProps = {
  rawData: unknown
}

export function SoftwareProposalFullSection({ rawData }: SoftwareProposalFullSectionProps) {
  const { setPlanningBoard } = useSoftwareProposal()
  const proposalPrintRootRef = useRef<HTMLDivElement>(null)
  const [pdfExporting, setPdfExporting] = useState(false)
  const [planningModalOpen, setPlanningModalOpen] = useState(false)
  const [planningUiPhase, setPlanningUiPhase] = useState<PlanningUiPhase>("intro")
  const [planningSubmitLoading, setPlanningSubmitLoading] = useState(false)
  const [planningSubmitError, setPlanningSubmitError] = useState<string | null>(null)
  const [planningLoaderStep, setPlanningLoaderStep] = useState(0)
  const [planningLoaderProgress, setPlanningLoaderProgress] = useState(8)
  const structured = parseStructuredProposal(rawData)

  useEffect(() => {
    if (planningUiPhase !== "working") return
    const stepTimer = window.setInterval(() => {
      setPlanningLoaderStep((s) => Math.min(s + 1, PLANNING_PIPELINE_STEPS.length - 1))
    }, 2100)
    const progressTimer = window.setInterval(() => {
      setPlanningLoaderProgress((p) => {
        if (p >= 94) return p
        return Math.min(94, p + 2.2 + Math.random() * 2.5)
      })
    }, 380)
    return () => {
      window.clearInterval(stepTimer)
      window.clearInterval(progressTimer)
    }
  }, [planningUiPhase])

  const handlePlanningOpenChange = useCallback(
    (open: boolean) => {
      if (!open && (planningUiPhase === "working" || planningUiPhase === "done")) return
      setPlanningModalOpen(open)
      if (!open) {
        setPlanningSubmitError(null)
        setPlanningLoaderStep(0)
        setPlanningLoaderProgress(8)
        setPlanningUiPhase("intro")
      }
    },
    [planningUiPhase]
  )

  const dismissPlanningModal = useCallback(() => {
    setPlanningUiPhase("intro")
    setPlanningSubmitError(null)
    setPlanningLoaderStep(0)
    setPlanningLoaderProgress(8)
    setPlanningModalOpen(false)
  }, [])

  const openPlanningModal = useCallback(() => {
    setPlanningUiPhase("intro")
    setPlanningSubmitError(null)
    setPlanningLoaderStep(0)
    setPlanningLoaderProgress(8)
    setPlanningModalOpen(true)
  }, [])

  const confirmStartPlanning = useCallback(async () => {
    setPlanningSubmitError(null)
    setPlanningUiPhase("working")
    setPlanningSubmitLoading(true)
    setPlanningLoaderStep(0)
    setPlanningLoaderProgress(8)
    try {
      const copilotSession = loadCopilotSession()
      const res = await fetch(PLANNING_WEBHOOK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "start_planning",
          planningConfirmed: true,
          proposalResponse: rawData,
          copilotSession,
        }),
      })
      const responseText = await res.text()
      if (!res.ok) {
        let message = `Request failed (${res.status})`
        try {
          const parsed = JSON.parse(responseText) as { error?: unknown }
          if (parsed && typeof parsed === "object" && parsed.error != null) {
            message = String(parsed.error)
          }
        } catch {
          if (responseText.trim()) message = responseText.slice(0, 200)
        }
        throw new Error(message)
      }
      let payload: unknown = responseText
      try {
        payload = responseText.trim() ? (JSON.parse(responseText) as unknown) : null
      } catch {
        payload = responseText
      }
      const board = parseKanbanBoardPayload(payload)
      if (!board) {
        throw new Error(
          "Planning succeeded but the response was not a valid board (expected boardTitle, columns, and tasks)."
        )
      }
      setPlanningBoard(board)
      setPlanningLoaderStep(PLANNING_PIPELINE_STEPS.length)
      setPlanningLoaderProgress(100)
      setPlanningUiPhase("done")
    } catch (e) {
      setPlanningSubmitError(e instanceof Error ? e.message : "Could not confirm planning")
      setPlanningUiPhase("done")
    } finally {
      setPlanningSubmitLoading(false)
    }
  }, [rawData, setPlanningBoard])

  const handleSavePdf = useCallback(async () => {
    const el = proposalPrintRootRef.current
    if (!el) {
      toast.error("Could not export PDF", { description: "Proposal content is not available yet." })
      return
    }
    setPdfExporting(true)
    try {
      el.scrollIntoView({ block: "nearest", behavior: "auto" })
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      await exportProposalToPdf(el)
      toast.success("PDF downloaded", { description: "Your proposal was exported as a multi-page A4 document." })
    } catch (e) {
      toast.error("PDF export failed", {
        description: e instanceof Error ? e.message : "Something went wrong while building the file.",
      })
    } finally {
      setPdfExporting(false)
    }
  }, [])

  return (
    <section
      id={SOFTWARE_PROPOSAL_OUTPUT_SECTION_ID}
      className="mt-10 w-full border-t border-border/50 bg-gradient-to-b from-muted/30 to-background pt-12 pb-10 sm:mt-14 sm:pt-16 sm:pb-14"
      aria-labelledby="software-proposal-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          id="proposal-section-toolbar"
          className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Proposal output</p>
            <h2
              id="software-proposal-heading"
              className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              Software business proposal
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Structured output from the proposal agent, using your locally saved copilot session.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-primary/30"
              disabled={pdfExporting}
              onClick={() => void handleSavePdf()}
            >
              {pdfExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileDown className="h-4 w-4" aria-hidden />}
              {pdfExporting ? "Building PDF…" : "Save as PDF"}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={openPlanningModal}>
              Start planning
            </Button>
          </div>
        </div>

        <div
          ref={proposalPrintRootRef}
          id="proposal-print-root"
          className="proposal-print-surface rounded-2xl border border-border/60 bg-card p-6 shadow-lg shadow-black/5 sm:p-10"
        >
          {structured?.kind === "app-suite" ? (
            <AppSuiteProposalBody app={structured.payload} />
          ) : structured?.kind === "classic" ? (
            <ProposalBody proposal={structured.payload} />
          ) : (
            <pre className="max-h-[min(70vh,28rem)] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/40 bg-secondary/25 p-4 font-mono text-xs leading-relaxed text-foreground sm:text-sm">
              {typeof rawData === "string"
                ? rawData
                : JSON.stringify(rawData, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <Dialog open={planningModalOpen} onOpenChange={handlePlanningOpenChange}>
        <DialogContent
          showCloseButton={planningUiPhase === "intro"}
          className={cn(
            "gap-0 overflow-hidden p-0 sm:max-w-2xl",
            (planningUiPhase === "working" || planningUiPhase === "done") && "sm:max-w-lg"
          )}
          onPointerDownOutside={(e) => {
            if (planningUiPhase === "working" || planningUiPhase === "done") e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (planningUiPhase === "working" || planningUiPhase === "done") e.preventDefault()
          }}
        >
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle>
                {planningUiPhase === "intro" && "Planning handoff — review before you continue"}
                {planningUiPhase === "working" && "Building your plan…"}
                {planningUiPhase === "done" &&
                  (planningSubmitError ? "Planning could not finish" : "Planning complete")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {planningUiPhase === "intro" &&
                  "Overview of how employee data, proposal inputs, and Kanban JSON outputs are used before you confirm planning."}
                {planningUiPhase === "working" && "Planning is running; progress steps are shown below."}
                {planningUiPhase === "done" &&
                  (planningSubmitError ? "An error occurred during planning." : "Planning finished successfully.")}
              </DialogDescription>
              {planningUiPhase === "intro" ? (
                <>
                  <p className="mt-2 text-left text-sm text-muted-foreground">
                    Below is how this step uses your proposal and people data, what you should expect back, and how the
                    UI will consume the response. Please confirm only if this matches your governance expectations.
                  </p>
                  <PlanningApproachExplainer />
                </>
              ) : planningUiPhase === "working" ? (
                <p className="mt-2 text-left text-sm text-muted-foreground">
                  You can read the steps below while n8n prepares your Kanban board. This dialog stays open until you
                  choose Completed.
                </p>
              ) : planningSubmitError ? (
                <p className="mt-2 text-left text-sm text-muted-foreground">
                  Review the error below, then choose Completed to close this window.
                </p>
              ) : (
                <p className="mt-2 text-left text-sm text-muted-foreground">
                  Your Kanban board is ready below. Choose Completed when you are done reviewing this summary.
                </p>
              )}
            </DialogHeader>
          </div>

          <AnimatePresence initial={false} mode="wait">
            {(planningUiPhase === "working" || planningUiPhase === "done") && (
              <motion.div
                key="planning-loader"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="border-t border-border/50 bg-muted/20 px-6 pb-6"
              >
                <div className="space-y-4 pt-4">
                  <PipelineDialogLoader
                    activeStepIndex={planningLoaderStep}
                    progress={planningLoaderProgress}
                    steps={PLANNING_PIPELINE_STEPS}
                    pipelineTitle="Planning pipeline"
                    pipelineSubtitle={
                      planningUiPhase === "done" && !planningSubmitError
                        ? "All steps finished."
                        : planningUiPhase === "done" && planningSubmitError
                          ? "Run ended with an error."
                          : "Hang tight — your board is being assembled."
                    }
                    isComplete={planningUiPhase === "done"}
                    errorMessage={planningUiPhase === "done" && planningSubmitError ? planningSubmitError : null}
                    footerHint={
                      planningUiPhase === "done" && !planningSubmitError
                        ? "Scroll down on the page to explore your new board."
                        : "Cold starts on n8n can add a few extra seconds — nothing is stuck."
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-border/50 bg-background p-6 pt-4">
            <DialogFooter className="gap-2 sm:justify-end">
              {planningUiPhase === "intro" ? (
                <>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="default"
                    className="min-w-[8.5rem] gap-2"
                    disabled={planningSubmitLoading}
                    onClick={() => void confirmStartPlanning()}
                  >
                    Yes — proceed with planning
                  </Button>
                </>
              ) : planningUiPhase === "working" ? (
                <p className="w-full text-center text-xs text-muted-foreground sm:text-left">
                  Please wait — this window stays open until the run finishes.
                </p>
              ) : (
                <Button type="button" variant="default" className="min-w-[10rem] sm:ml-auto" onClick={dismissPlanningModal}>
                  Completed
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
