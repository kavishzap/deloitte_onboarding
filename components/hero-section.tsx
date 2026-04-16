"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, GitBranch, FileText, FlaskConical, Database } from "lucide-react"

const trustBadges = [
  { icon: GitBranch, label: "Structured AI Workflow" },
  { icon: FileText, label: "Executive Ready Output" },
  { icon: FlaskConical, label: "Deloitte Hackathon Demo" },
  { icon: Database, label: "Synthetic Data Only" },
]

const COPILOT_SECTION_ID = "transformation-copilot"

function scrollToCopilot() {
  document.getElementById(COPILOT_SECTION_ID)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50 lg:min-h-[calc(100svh-4rem)] lg:flex lg:flex-col lg:justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container relative mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10 lg:items-center"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl lg:max-w-lg">
              From business challenge to{" "}
              <span className="text-primary">executive-ready strategy</span>
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0 lg:max-w-md">
              An AI-powered consulting workflow that understands business problems, builds an execution plan,
              diagnoses root causes, designs solutions, estimates impact, and produces an executive summary.
            </p>

            <div className="mt-5 flex justify-center lg:justify-start">
              <Button
                type="button"
                size="default"
                className="h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 sm:h-11 sm:px-7"
                onClick={scrollToCopilot}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Automation
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-2.5 lg:justify-start"
            >
              {trustBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-border/40 bg-secondary/30 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary/50 sm:text-xs sm:px-3 sm:py-1.5"
                >
                  <badge.icon className="mr-1.5 h-3 w-3 text-primary/70 sm:mr-2 sm:h-3.5 sm:w-3.5" />
                  {badge.label}
                </Badge>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative mx-auto w-full max-w-[13rem] sm:max-w-[15rem] lg:mx-0 lg:h-[min(52dvh,32rem)] lg:max-h-[calc(100svh-6rem)] lg:w-full lg:max-w-md">
              <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-2xl" />
              <motion.div
                className="relative h-[13rem] w-full overflow-hidden rounded-2xl bg-transparent sm:h-[15rem] lg:h-full lg:min-h-[min(48dvh,28rem)]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="relative h-full w-full origin-center will-change-transform"
                  animate={{
                    scale: [1, 1.07, 1.03, 1.08, 1],
                    x: [0, "3%", "-2%", "2%", 0],
                    y: [0, "-2%", "1.5%", "-1%", 0],
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/deloittebot.png"
                    alt="Deloitte AI transformation copilot"
                    fill
                    className="scale-[1.02] object-contain object-center"
                    sizes="(max-width: 1024px) 60vw, 28rem"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
