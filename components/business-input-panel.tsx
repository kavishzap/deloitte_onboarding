"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Play, Upload, ShoppingCart, FileCheck, BookOpen, Headphones } from "lucide-react"

const sampleUseCases = [
  { icon: ShoppingCart, title: "Retail Cost Optimization", description: "Reduce operational costs" },
  { icon: FileCheck, title: "Compliance Reporting", description: "Automate regulatory reporting" },
  { icon: BookOpen, title: "Knowledge Management", description: "AI-powered knowledge assistant" },
  { icon: Headphones, title: "Customer Service", description: "Transform support operations" },
]

export function BusinessInputPanel() {
  const [challenge, setChallenge] = useState("")

  const loadDemoCase = () => {
    setChallenge("A retail client wants to reduce operational cost by 20% and improve inventory management through AI-driven demand forecasting and automated replenishment systems.")
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Business Challenge Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Transformation Request</Label>
              <Textarea 
                placeholder="A retail client wants to reduce operational cost by 20% and improve inventory management."
                className="min-h-[120px] bg-secondary/50 border-border/50 rounded-xl text-sm resize-none focus:ring-primary/30"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Industry</Label>
                <Select defaultValue="retail">
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-lg h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Function</Label>
                <Select defaultValue="operations">
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-lg h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Objective</Label>
                <Select defaultValue="cost">
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-lg h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost">Cost Reduction</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="cx">Customer Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Urgency</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-lg h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Platform</Label>
                <Select defaultValue="azure">
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-lg h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="azure">Azure</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="gcp">Google Cloud</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">LLM</Label>
                <Select defaultValue="gpt4">
                  <SelectTrigger className="bg-secondary/50 border-border/50 rounded-lg h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4o</SelectItem>
                    <SelectItem value="claude">Claude 3.5</SelectItem>
                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                    <SelectItem value="llama">Llama 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 rounded-xl">
                <Play className="mr-2 h-4 w-4" />
                Start AI Workflow
              </Button>
              <Button 
                variant="outline" 
                className="border-border/50 hover:bg-secondary/80 h-10 rounded-xl"
                onClick={loadDemoCase}
              >
                <Upload className="mr-2 h-4 w-4" />
                Load Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sample Use Cases */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sample Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleUseCases.map((useCase, index) => (
              <button
                key={index}
                onClick={() => setChallenge(`${useCase.title}: ${useCase.description}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/30 hover:border-primary/30 transition-all text-left group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <useCase.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{useCase.title}</p>
                  <p className="text-xs text-muted-foreground">{useCase.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
