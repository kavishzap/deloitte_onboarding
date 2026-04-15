"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, Zap, Clock, Target, Lightbulb, Rocket, Settings, Compass } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const metrics = [
  { icon: TrendingDown, label: "Cost Reduction Potential", value: "$4.2M", subtext: "Annual savings" },
  { icon: Zap, label: "Efficiency Improvement", value: "35%", subtext: "Process optimization" },
  { icon: Clock, label: "Time Savings", value: "120h", subtext: "Per month" },
  { icon: Target, label: "Confidence Score", value: "87%", subtext: "High confidence" },
]

const chartData = [
  { month: "Month 1", impact: 0, projected: 5 },
  { month: "Month 3", impact: 8, projected: 15 },
  { month: "Month 6", impact: 25, projected: 35 },
  { month: "Month 9", impact: 45, projected: 55 },
  { month: "Month 12", impact: 70, projected: 80 },
  { month: "Month 18", impact: 100, projected: 100 },
]

const chartConfig = {
  impact: {
    label: "Realized Impact",
    color: "var(--chart-1)",
  },
  projected: {
    label: "Projected Impact",
    color: "var(--chart-2)",
  },
}

const insights = [
  { icon: Lightbulb, label: "Main Value Driver", value: "AI-powered demand forecasting" },
  { icon: Rocket, label: "Fastest Quick Win", value: "Data consolidation (4 weeks)" },
  { icon: Settings, label: "Prototype Feasibility", value: "High - proven tech stack" },
  { icon: Compass, label: "Recommended Pilot", value: "2 distribution centers" },
]

export function BusinessValueSection() {
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Projected Business Value</h2>
          <p className="text-muted-foreground">Estimated impact and ROI based on AI agent analysis</p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtext}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Chart and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground">Transformation Impact Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillImpact" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        stroke="var(--muted-foreground)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="var(--chart-2)"
                        fill="url(#fillProjected)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Area
                        type="monotone"
                        dataKey="impact"
                        stroke="var(--chart-1)"
                        fill="url(#fillImpact)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <insight.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{insight.label}</p>
                      <p className="text-sm font-medium text-foreground">{insight.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
