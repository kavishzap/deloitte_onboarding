"use client"

import { CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { ParsedResponse } from "@/lib/copilot-response-types"

export function ExecutiveResponseBody({ response }: { response: ParsedResponse }) {
  return (
    <div className="space-y-5">
      {response.executiveSummary && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Executive Summary</h4>
          <p className="text-sm leading-relaxed text-foreground">{response.executiveSummary}</p>
        </div>
      )}

      {response.keyRecommendations && response.keyRecommendations.length > 0 && (
        <>
          {response.executiveSummary && <Separator className="bg-border/30" />}
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key Recommendations</h4>
            <ul className="space-y-1.5">
              {response.keyRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {response.expectedBusinessValue && (
        <>
          <Separator className="bg-border/30" />
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expected Business Value</h4>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-medium text-foreground">{response.expectedBusinessValue}</p>
            </div>
          </div>
        </>
      )}

      {response.nextSteps && response.nextSteps.length > 0 && (
        <>
          <Separator className="bg-border/30" />
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next Steps</h4>
            <ol className="space-y-1.5">
              {response.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/50 bg-secondary text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  )
}
