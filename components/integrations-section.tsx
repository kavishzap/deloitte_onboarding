"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
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
        </motion.div>

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
      </div>
    </section>
  )
}
