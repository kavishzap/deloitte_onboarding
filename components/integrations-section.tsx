"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const INTEGRATIONS = [
  {
    name: "n8n",
    subtitle: "Workflow automation",
    description: "Webhooks, orchestration, and glue between your data and the copilot.",
    accent: "from-emerald-500/20 to-teal-500/5 border-emerald-500/25",
  },
  {
    name: "OpenAI",
    subtitle: "AI platform",
    description: "Models for analysis, summarisation, and structured transformation outputs.",
    accent: "from-primary/15 to-transparent border-primary/25",
  },
  {
    name: "LLM",
    subtitle: "Large language models",
    description: "Reasoning for chat and voice; Hugging Face stands in for the broader open-model tooling around LLMs.",
    accent: "from-violet-500/15 to-transparent border-violet-500/25",
  },
] as const

export function IntegrationsSection() {
  return (
    <section className="border-t border-border/40 bg-muted/20 py-14 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Collapsible defaultOpen={false} className="group mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-label="Toggle Stack section: models, platforms, and workflow diagrams"
                className="w-full rounded-2xl border border-border/40 bg-card/40 px-4 py-4 text-center shadow-sm outline-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-6 sm:py-5"
              >
                <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
                  Stack
                </Badge>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Models &amp; platforms integrated
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Core services wired into this prototype — orchestration, models, and the LLM layer.
                </p>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <ChevronDown
                    className="h-6 w-6 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    <span className="group-data-[state=open]:hidden">Show stack and workflows</span>
                    <span className="hidden group-data-[state=open]:inline">Hide stack and workflows</span>
                  </span>
                </div>
              </button>
            </CollapsibleTrigger>
          </motion.div>

          <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
              {INTEGRATIONS.map((item, i) => (
                <motion.article
                  key={item.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm ${item.accent}`}
                >
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mx-auto mt-14 max-w-5xl"
            >
              <h3 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Deloitte Onboarding AI Agent
              </h3>
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/5">
                <Image
                  src="/workflow1.png"
                  alt="Deloitte Onboarding AI Agent workflow diagram"
                  width={1600}
                  height={900}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>
              <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                This agent orchestrates the new-hire journey end to end: it collects starter information, validates documents
                and policy checks, routes tasks to the right teams, and keeps candidates and hiring managers updated with
                consistent, auditable updates — reducing manual follow-ups and shortening time-to-productivity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mx-auto mt-16 max-w-5xl"
            >
              <h3 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Project Proposal Agent
              </h3>
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/5">
                <Image
                  src="/workflow2.png"
                  alt="Project Proposal Agent workflow diagram"
                  width={1600}
                  height={900}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>
              <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                This agent turns a captured business challenge and executive-style outputs into a client-ready project
                proposal: it frames the problem, outlines the solution and modules, sequences implementation steps, and
                articulates expected outcomes — so teams can align on scope, value, and delivery without rebuilding the
                narrative from scratch.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto mt-14 max-w-5xl"
              >
                <h3 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Planning &amp; Kanban handoff
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-foreground sm:text-sm">
                  Continues the Project Proposal Agent path — from structured proposal to an executable board.
                </p>
                <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/5">
                  <Image
                    src="/workflow3.png"
                    alt="Planning and Kanban handoff workflow diagram for the Project Proposal Agent"
                    width={1600}
                    height={900}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                  />
                </div>
                <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                  After the proposal is confirmed, this flow allocates work across roles, respects availability, and lays out
                  columns and tasks so delivery teams can run the plan as a Kanban board — connecting executive intent to
                  day-to-day execution without losing context.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mx-auto mt-14 max-w-5xl"
              >
                <h3 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Proposal code agent
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-foreground sm:text-sm">
                  Follows the planning path — webhook-triggered agent with model, memory, tools, and a structured proposal
                  return.
                </p>
                <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/5">
                  <Image
                    src="/workflow4.png"
                    alt="n8n workflow: Webhook, code Agent with OpenAI and SerpAPI, Return Proposal"
                    width={1600}
                    height={900}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                  />
                </div>
                <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                  This canvas shows how a single POST kicks off the code agent: the OpenAI chat model carries the reasoning,
                  SerpAPI can enrich answers with live web context, and the flow ends in a clean &quot;Return Proposal&quot;
                  payload — the same pattern the app proxies through Next.js to your n8n instance.
                </p>
              </motion.div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  )
}
