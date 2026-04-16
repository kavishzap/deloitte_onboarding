"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingDown, Zap, Clock, Target } from "lucide-react"

const executiveSummary = {
  summary: "The proposed AI-driven transformation will enable the retail client to achieve 20%+ cost reduction through intelligent inventory management, demand forecasting, and automated replenishment systems.",
  recommendations: [
    "Implement ML-based demand forecasting",
    "Deploy automated inventory replenishment",
    "Integrate real-time supply chain visibility",
    "Establish continuous optimization feedback loops"
  ],
  businessValue: "$4.2M annual savings with 18-month payback period. ROI of 340% over 3 years.",
  nextSteps: [
    "Executive stakeholder alignment session",
    "Data infrastructure assessment",
    "Pilot scope definition for 2 distribution centers"
  ]
}

const kpis = [
  { icon: TrendingDown, label: "Est. Cost Reduction", value: "22%", trend: "+2%" },
  { icon: Zap, label: "Efficiency Gain", value: "35%", trend: "+5%" },
  { icon: Clock, label: "Time Saved", value: "120h/mo", trend: "avg" },
  { icon: Target, label: "Confidence", value: "87%", trend: "high" },
]

export function ExecutiveOutputPanel() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              Executive Output
              <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs">
                Ready for Review
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Executive Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Executive Summary</h4>
              <p className="text-sm text-foreground leading-relaxed">{executiveSummary.summary}</p>
            </div>
            
            <Separator className="bg-border/30" />
            
            {/* Key Recommendations */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key Recommendations</h4>
              <ul className="space-y-1.5">
                {executiveSummary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            <Separator className="bg-border/30" />
            
            {/* Business Value */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expected Business Value</h4>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground font-medium">{executiveSummary.businessValue}</p>
              </div>
            </div>
            
            <Separator className="bg-border/30" />
            
            {/* Next Steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Steps</h4>
              <ol className="space-y-1.5">
                {executiveSummary.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="h-5 w-5 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-xs text-muted-foreground shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-card border-border/50 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  {kpi.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}
