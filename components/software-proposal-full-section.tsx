"use client"

import { useCallback, useState, type ComponentType } from "react"
import {
  Boxes,
  FileDown,
  Layers,
  ListOrdered,
  Loader2,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import type { AppSuiteProposalPayload, SoftwareProposalPayload } from "@/lib/software-proposal-types"
import { parseStructuredProposal } from "@/lib/software-proposal-types"
import { loadCopilotSession } from "@/lib/copilot-local-session"
import { parseKanbanBoardPayload } from "@/lib/kanban-planning-types"
import { useSoftwareProposal } from "@/components/software-proposal-context"

const PLANNING_WEBHOOK_API = "/api/n8n/planning"

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
    <div className="space-y-8">
      <header className="space-y-3 border-b border-border/40 pb-6">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{app.appName}</h1>
        {app.appDescription ? (
          <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">{app.appDescription}</p>
        ) : null}
      </header>

      <ProposalBlock icon={Target} title="Problem statement">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">
          {app.problemStatement || "—"}
        </p>
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={Layers} title="Solution overview">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">
          {app.solutionOverview || "—"}
        </p>
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={ListOrdered} title="Core features">
        <NumberedList items={app.coreFeatures} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={Sparkles} title="Advanced features">
        <BulletList items={app.advancedFeatures} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={Users} title="User roles">
        <RoleChips items={app.userRoles} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={Boxes} title="System modules">
        <ModuleGrid items={app.systemModules} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={ListOrdered} title="Implementation plan">
        <NumberedList items={app.implementationPlan} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={ListOrdered} title="Expected outcomes">
        <NumberedList items={app.expectedOutcomes} />
      </ProposalBlock>
    </div>
  )
}

function ProposalBody({ proposal }: { proposal: SoftwareProposalPayload }) {
  return (
    <div className="space-y-8">
      <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {proposal.proposalTitle}
      </h1>

      <ProposalBlock icon={Target} title="Client problem">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">{proposal.clientProblem}</p>
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={Layers} title="Solution overview">
        <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">{proposal.solutionOverview}</p>
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={ListOrdered} title="Proposed modules">
        <NumberedList items={proposal.proposedModules} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={ListOrdered} title="Implementation plan">
        <NumberedList items={proposal.implementationPlan} />
      </ProposalBlock>

      <Separator className="bg-border/40" />

      <ProposalBlock icon={ListOrdered} title="Expected outcomes">
        <NumberedList items={proposal.expectedOutcomes} />
      </ProposalBlock>
    </div>
  )
}

type SoftwareProposalFullSectionProps = {
  rawData: unknown
}

export function SoftwareProposalFullSection({ rawData }: SoftwareProposalFullSectionProps) {
  const [planningModalOpen, setPlanningModalOpen] = useState(false)
  const [planningSubmitLoading, setPlanningSubmitLoading] = useState(false)
  const [planningSubmitError, setPlanningSubmitError] = useState<string | null>(null)
  const structured = parseStructuredProposal(rawData)

  const onPlanningModalOpenChange = useCallback((open: boolean) => {
    setPlanningModalOpen(open)
    if (!open) setPlanningSubmitError(null)
  }, [])

  const confirmStartPlanning = useCallback(async () => {
    setPlanningSubmitError(null)
    setPlanningSubmitLoading(true)
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
      setPlanningModalOpen(false)
    } catch (e) {
      setPlanningSubmitError(e instanceof Error ? e.message : "Could not confirm planning")
    } finally {
      setPlanningSubmitLoading(false)
    }
  }, [rawData, setPlanningBoard])

  return (
    <section
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
            <Button type="button" variant="outline" className="gap-2 border-primary/30" onClick={() => window.print()}>
              <FileDown className="h-4 w-4" />
              Save as PDF
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => setPlanningModalOpen(true)}>
              Start planning
            </Button>
          </div>
        </div>

        <div
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

      <Dialog open={planningModalOpen} onOpenChange={onPlanningModalOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start planning</DialogTitle>
            <DialogDescription className="text-left text-base leading-relaxed">
              Do you want to continue? Employee data and their availability will be used.
            </DialogDescription>
          </DialogHeader>
          {planningSubmitError ? (
            <p className="text-sm text-destructive" role="alert">
              {planningSubmitError}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={planningSubmitLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              className="gap-2"
              disabled={planningSubmitLoading}
              onClick={() => void confirmStartPlanning()}
            >
              {planningSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
