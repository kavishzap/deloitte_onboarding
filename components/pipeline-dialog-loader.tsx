"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Check, Circle, Loader2, Sparkles } from "lucide-react"
import type { ComponentType } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type PipelineLoaderStep = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}

export function PipelineDialogLoader({
  activeStepIndex,
  progress,
  steps,
  pipelineTitle,
  pipelineSubtitle,
  footerHint = "Cold starts on n8n can add a few extra seconds — nothing is stuck.",
  isComplete = false,
  errorMessage = null,
}: {
  activeStepIndex: number
  progress: number
  steps: PipelineLoaderStep[]
  pipelineTitle: string
  pipelineSubtitle: string
  footerHint?: string
  /** When true, header/footer reflect a finished run (no spinners). */
  isComplete?: boolean
  /** When set with `isComplete`, shows error styling in the header instead of a success check. */
  errorMessage?: string | null
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-b from-primary/[0.07] via-background to-background p-1 shadow-inner">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl bg-[conic-gradient(from_180deg_at_50%_50%,var(--primary)_0deg,transparent_120deg,transparent_240deg,var(--primary)_360deg)] opacity-40 blur-sm"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-[10px] bg-card/95 px-4 py-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10"
              animate={isComplete ? {} : { scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: isComplete ? 0 : Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            </motion.span>
            <div>
              <p className="text-sm font-semibold text-foreground">{pipelineTitle}</p>
              <p className="text-xs text-muted-foreground">{pipelineSubtitle}</p>
            </div>
          </div>
          {isComplete && errorMessage ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" strokeWidth={2.25} aria-hidden />
          ) : isComplete ? (
            <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} aria-hidden />
          ) : (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          )}
        </div>

        <div className="mb-5 space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(Math.min(progress, 100))}%</span>
          </div>
          <Progress
            value={Math.min(progress, 100)}
            className="h-2 bg-secondary/80 [&>div]:transition-all [&>div]:duration-700"
          />
        </div>

        <ul className="space-y-3" aria-label="Pipeline steps">
          {steps.map((step, i) => {
            const done = i < activeStepIndex
            const active = i === activeStepIndex
            const Icon = step.icon
            return (
              <motion.li
                key={step.title}
                layout
                initial={false}
                animate={{
                  opacity: done || active ? 1 : 0.45,
                  x: done || active ? 0 : -6,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "flex gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                  active && "border-primary/35 bg-primary/[0.06] shadow-sm shadow-primary/5",
                  done && "border-emerald-500/25 bg-emerald-500/[0.04]",
                  !done && !active && "border-transparent bg-transparent"
                )}
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        className="flex text-emerald-600 dark:text-emerald-400"
                      >
                        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                      </motion.span>
                    ) : active ? (
                      <motion.span
                        key="spin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-primary"
                      >
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      </motion.span>
                    ) : (
                      <motion.span key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground">
                        <Circle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
                    <p className={cn("text-sm font-medium leading-snug", active ? "text-foreground" : "text-foreground/85")}>
                      {step.title}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </motion.li>
            )
          })}
        </ul>

        {isComplete ? (
          <p
            className={cn(
              "mt-4 text-center text-[11px]",
              errorMessage ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {errorMessage ?? footerHint}
          </p>
        ) : (
          <motion.p
            className="mt-4 text-center text-[11px] text-muted-foreground"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            {footerHint}
          </motion.p>
        )}
      </div>
    </div>
  )
}
