"use client"

import { FileJson, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExecutiveResponseBody } from "@/components/executive-response-body"
import { extractExecutiveLikePayload } from "@/lib/proposal-response-format"

function KeyValueBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h4>
      <div className="mt-2 text-sm text-foreground">{children}</div>
    </div>
  )
}

function renderPrimitive(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return (
    <pre className="overflow-x-auto rounded-md bg-secondary/40 p-2 text-xs leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

function GenericObjectDocument({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data)
  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <KeyValueBlock key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}>
          {value !== null && typeof value === "object" ? (
            <pre className="max-h-48 overflow-auto text-xs leading-relaxed text-foreground/90">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            renderPrimitive(value)
          )}
        </KeyValueBlock>
      ))}
    </div>
  )
}

type ProposalDocumentViewerProps = {
  data: unknown
  title?: string
}

export function ProposalDocumentViewer({ data, title = "Business proposal" }: ProposalDocumentViewerProps) {
  if (data === null || data === undefined) {
    return (
      <div
        id="proposal-print-root"
        className="proposal-print-surface rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground sm:p-6"
      >
        Empty response.
      </div>
    )
  }

  const executive = extractExecutiveLikePayload(data)

  return (
    <div
      id="proposal-print-root"
      className="proposal-print-surface rounded-xl border border-border/60 bg-card p-4 shadow-inner sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
          {executive ? <FileText className="h-4 w-4 text-primary" /> : <FileJson className="h-4 w-4 text-primary" />}
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Generated from your saved copilot session</p>
        </div>
      </div>

      <ScrollArea className="max-h-[min(70vh,32rem)] pr-3">
        <div className="space-y-4 pb-2">
          {typeof data === "string" ? (
            <pre className="whitespace-pre-wrap break-words rounded-lg border border-border/40 bg-secondary/25 p-4 text-sm leading-relaxed text-foreground">
              {data}
            </pre>
          ) : executive ? (
            <ExecutiveResponseBody response={executive} />
          ) : data !== null && typeof data === "object" && !Array.isArray(data) ? (
            <GenericObjectDocument data={data as Record<string, unknown>} />
          ) : Array.isArray(data) ? (
            <ul className="space-y-3">
              {data.map((item, i) => (
                <li key={i} className="rounded-lg border border-border/40 bg-secondary/20 p-3 text-sm">
                  {typeof item === "object" && item !== null ? (
                    <pre className="overflow-x-auto text-xs leading-relaxed">{JSON.stringify(item, null, 2)}</pre>
                  ) : (
                    renderPrimitive(item)
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No displayable content.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
