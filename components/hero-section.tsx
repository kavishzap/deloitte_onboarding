"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, GitBranch, Shield, FileText, FlaskConical, Database } from "lucide-react"

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
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container relative mx-auto px-6 py-16 lg:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
            From business challenge to{" "}
            <span className="text-primary">executive-ready strategy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed text-pretty">
            An AI-powered consulting workflow that understands business problems, builds an execution plan, 
            diagnoses root causes, designs solutions, estimates impact, and produces an executive summary.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              type="button"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-xl shadow-lg shadow-primary/20"
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
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {trustBadges.map((badge, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="border-border/40 bg-secondary/30 text-muted-foreground hover:bg-secondary/50 transition-colors px-4 py-2 text-xs font-medium"
              >
                <badge.icon className="mr-2 h-3.5 w-3.5 text-primary/70" />
                {badge.label}
              </Badge>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
