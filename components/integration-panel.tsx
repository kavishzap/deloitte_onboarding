"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Link2, CheckCircle2, Clock, Hash, Send, ArrowDownToLine } from "lucide-react"

const requestPreview = {
  endpoint: "/api/v1/transform",
  method: "POST",
  body: {
    challenge: "Reduce operational cost by 20%",
    industry: "Retail",
    objective: "Cost Reduction",
    urgency: "Medium"
  }
}

const responsePreview = {
  status: "completed",
  run_id: "run_847a9f2c",
  agents_completed: 6,
  total_duration: "4.2s",
  output_available: true
}

export function IntegrationPanel() {
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Workflow Integration</h2>
          <p className="text-muted-foreground">Backend connectivity status and API integration details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Connection Status */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Connection Status</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">API Endpoint</Label>
                        <Input 
                          value="https://n8n.deloitte-hackathon.internal/webhook/transform"
                          readOnly
                          className="bg-secondary/50 border-border/50 rounded-lg text-sm font-mono"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs text-muted-foreground">Status</span>
                          </div>
                          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                            Connected
                          </Badge>
                        </div>
                        
                        <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Last Run</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">2 min ago</p>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Run ID</span>
                        </div>
                        <p className="text-sm font-mono text-foreground">run_847a9f2c-3e1d-4b5a</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request/Response Preview */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Request Preview</h3>
                    </div>
                    <pre className="p-3 rounded-xl bg-secondary/30 border border-border/30 text-xs text-muted-foreground overflow-x-auto font-mono">
{JSON.stringify(requestPreview, null, 2)}
                    </pre>
                  </div>
                  
                  <Separator className="bg-border/30" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ArrowDownToLine className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Response Preview</h3>
                    </div>
                    <pre className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground overflow-x-auto font-mono">
{JSON.stringify(responsePreview, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
