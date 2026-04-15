"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Target, AlertCircle, CheckCircle2, ArrowRight, TrendingUp, Clock, Users } from "lucide-react"

const demoScenario = {
  industry: "Retail",
  objective: "Cost Reduction",
  challenge: "A major retail client is facing increasing operational costs and inventory inefficiencies. They aim to reduce operational costs by 20% while simultaneously improving inventory management accuracy and reducing stockouts across their 200+ store network.",
  context: {
    stores: "200+",
    annual_revenue: "$2.4B",
    current_inventory_accuracy: "78%",
    target_timeline: "12 months"
  }
}

const sampleOutput = {
  executive_headline: "AI-Driven Inventory Transformation Enables $4.2M Annual Savings",
  strategic_recommendation: "Implement intelligent inventory optimization platform with ML-based demand forecasting",
  key_outcomes: [
    { metric: "Cost Reduction", value: "22%", description: "Exceeding 20% target" },
    { metric: "Inventory Accuracy", value: "96%", description: "Up from 78%" },
    { metric: "Stockout Reduction", value: "65%", description: "Improved availability" },
    { metric: "ROI", value: "340%", description: "Over 3 years" },
  ],
  implementation_phases: [
    { phase: "Discovery", duration: "2 weeks", status: "Foundation" },
    { phase: "Design", duration: "3 weeks", status: "Architecture" },
    { phase: "Pilot", duration: "4 weeks", status: "Validation" },
    { phase: "Scale", duration: "3 weeks", status: "Rollout" },
  ]
}

export function DemoSection() {
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Demo Scenario</h2>
          <p className="text-muted-foreground">Sample input and output showcasing the transformation workflow</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Scenario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Input: Business Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                    <Building2 className="mr-1.5 h-3 w-3" />
                    {demoScenario.industry}
                  </Badge>
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                    <Target className="mr-1.5 h-3 w-3" />
                    {demoScenario.objective}
                  </Badge>
                </div>
                
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <p className="text-sm text-foreground leading-relaxed">{demoScenario.challenge}</p>
                </div>
                
                <Separator className="bg-border/30" />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Store Network</p>
                    <p className="text-lg font-bold text-foreground">{demoScenario.context.stores}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Annual Revenue</p>
                    <p className="text-lg font-bold text-foreground">{demoScenario.context.annual_revenue}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Current Accuracy</p>
                    <p className="text-lg font-bold text-foreground">{demoScenario.context.current_inventory_accuracy}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Target Timeline</p>
                    <p className="text-lg font-bold text-foreground">{demoScenario.context.target_timeline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Output: Executive Summary Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="text-sm font-bold text-primary mb-2">{sampleOutput.executive_headline}</h4>
                  <p className="text-xs text-muted-foreground">{sampleOutput.strategic_recommendation}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {sampleOutput.key_outcomes.map((outcome, index) => (
                    <div key={index} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-xs text-muted-foreground mb-1">{outcome.metric}</p>
                      <p className="text-xl font-bold text-emerald-400">{outcome.value}</p>
                      <p className="text-xs text-muted-foreground">{outcome.description}</p>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-border/30" />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Implementation Roadmap</p>
                  <div className="flex items-center justify-between">
                    {sampleOutput.implementation_phases.map((phase, index) => (
                      <div key={index} className="flex items-center">
                        <div className="text-center">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-1 mx-auto">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <p className="text-xs font-medium text-foreground">{phase.phase}</p>
                          <p className="text-xs text-muted-foreground">{phase.duration}</p>
                        </div>
                        {index < sampleOutput.implementation_phases.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-primary/40 mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
