"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, FileInput, ListChecks, Stethoscope, Blocks, TrendingUp, FileOutput, ArrowRight } from "lucide-react"

const workflowSteps = [
  { icon: MessageSquare, title: "Business Challenge", description: "Raw input from stakeholder" },
  { icon: FileInput, title: "Structured Request", description: "AI-parsed requirements" },
  { icon: ListChecks, title: "Execution Plan", description: "Phased delivery roadmap" },
  { icon: Stethoscope, title: "Business Diagnosis", description: "Root cause analysis" },
  { icon: Blocks, title: "Solution Architecture", description: "Technical design" },
  { icon: TrendingUp, title: "Impact Estimation", description: "ROI & value projection" },
  { icon: FileOutput, title: "Executive Summary", description: "Decision-ready output" },
]

export function HowItWorksSection() {
  return (
    <section className="py-12 lg:py-16 border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">How the System Works</h2>
          <p className="text-muted-foreground">End-to-end AI workflow from challenge to executive-ready strategy</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between overflow-x-auto pb-4">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex flex-col items-center text-center min-w-[120px]"
                    >
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 transition-all hover:bg-primary/20 hover:scale-105">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </motion.div>
                    
                    {index < workflowSteps.length - 1 && (
                      <div className="mx-4 flex-shrink-0">
                        <ArrowRight className="h-5 w-5 text-primary/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
