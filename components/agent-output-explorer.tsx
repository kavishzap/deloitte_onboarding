"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Inbox, ListTodo, Stethoscope, Blocks, TrendingUp, FileText } from "lucide-react"

const agentOutputs = {
  intake: {
    icon: Inbox,
    title: "Intake Output",
    data: {
      request_id: "REQ-2024-0847",
      timestamp: "2024-03-15T14:32:00Z",
      input_summary: "Retail cost optimization with inventory focus",
      structured_request: {
        industry: "Retail",
        business_function: "Operations",
        primary_objective: "Cost Reduction",
        target_metric: "20% reduction in operational costs",
        secondary_objective: "Inventory Management Improvement",
        urgency_level: "Medium",
        stakeholder_tier: "Executive"
      },
      validation_status: "PASSED",
      confidence_score: 0.94
    }
  },
  planner: {
    icon: ListTodo,
    title: "Planner Output",
    data: {
      execution_plan: {
        total_phases: 4,
        estimated_duration: "12 weeks",
        phases: [
          { name: "Discovery & Assessment", duration: "2 weeks", deliverables: ["Current state analysis", "Data audit", "Stakeholder interviews"] },
          { name: "Solution Design", duration: "3 weeks", deliverables: ["Architecture blueprint", "Integration plan", "Risk assessment"] },
          { name: "Pilot Implementation", duration: "4 weeks", deliverables: ["MVP deployment", "Performance benchmarks", "User training"] },
          { name: "Scale & Optimize", duration: "3 weeks", deliverables: ["Full rollout", "Optimization cycles", "Success metrics"] }
        ]
      },
      resource_requirements: {
        team_size: "8-10 FTEs",
        key_roles: ["Project Lead", "Data Engineer", "ML Engineer", "Business Analyst"]
      }
    }
  },
  consultant: {
    icon: Stethoscope,
    title: "Consultant Output",
    data: {
      diagnosis: {
        root_causes: [
          { cause: "Manual inventory tracking processes", impact: "High", addressable: true },
          { cause: "Lack of demand forecasting capabilities", impact: "High", addressable: true },
          { cause: "Siloed data across systems", impact: "Medium", addressable: true },
          { cause: "Reactive rather than proactive replenishment", impact: "High", addressable: true }
        ],
        opportunity_areas: [
          "AI-driven demand prediction with 85%+ accuracy",
          "Automated purchase order generation",
          "Real-time inventory visibility across locations",
          "Dynamic safety stock optimization"
        ],
        quick_wins: [
          "Consolidate inventory data sources",
          "Implement basic demand forecasting model"
        ]
      }
    }
  },
  solution: {
    icon: Blocks,
    title: "Solution Design",
    data: {
      architecture: {
        solution_name: "Intelligent Inventory Optimization Platform",
        core_components: [
          { name: "Demand Forecasting Engine", technology: "Azure ML + Time Series Models", purpose: "Predict demand patterns" },
          { name: "Inventory Optimizer", technology: "Custom Optimization Algorithm", purpose: "Calculate optimal stock levels" },
          { name: "Auto-Replenishment System", technology: "n8n + ERP Integration", purpose: "Automate purchase orders" },
          { name: "Analytics Dashboard", technology: "Power BI Embedded", purpose: "Real-time visibility & reporting" }
        ],
        integration_points: ["SAP ERP", "Warehouse Management System", "Supplier Portal"],
        data_flows: "Real-time + Batch processing hybrid approach"
      },
      technical_requirements: {
        cloud_platform: "Azure",
        compute: "Azure ML Workspace + AKS",
        storage: "Azure Data Lake Gen2",
        security: "Azure AD + RBAC"
      }
    }
  },
  impact: {
    icon: TrendingUp,
    title: "Impact Analysis",
    data: {
      business_impact: {
        cost_savings: {
          annual_estimate: "$4.2M",
          breakdown: {
            inventory_holding_reduction: "$1.8M",
            stockout_prevention: "$1.4M",
            labor_efficiency: "$0.6M",
            waste_reduction: "$0.4M"
          }
        },
        efficiency_gains: {
          forecast_accuracy_improvement: "35%",
          order_processing_time_reduction: "60%",
          inventory_turnover_improvement: "25%"
        },
        roi_analysis: {
          implementation_cost: "$1.2M",
          payback_period: "18 months",
          three_year_roi: "340%"
        }
      },
      risk_assessment: {
        overall_risk: "Medium-Low",
        key_risks: ["Data quality dependencies", "Change management adoption"],
        mitigation_strategies: ["Data cleansing sprint", "Phased rollout with champions"]
      }
    }
  },
  summary: {
    icon: FileText,
    title: "Executive Summary",
    data: {
      executive_brief: {
        headline: "AI-Driven Inventory Transformation: $4.2M Annual Savings Opportunity",
        strategic_recommendation: "PROCEED with phased implementation",
        confidence_level: "High (87%)",
        key_message: "The proposed solution addresses critical operational inefficiencies through proven AI/ML technologies, delivering substantial ROI with manageable implementation risk."
      },
      decision_summary: {
        investment_required: "$1.2M (implementation + Year 1 operations)",
        expected_return: "$4.2M annually by Year 2",
        time_to_value: "6 months to first measurable impact",
        strategic_alignment: "Supports digital transformation and operational excellence initiatives"
      },
      immediate_actions: [
        "Schedule executive sponsor alignment meeting",
        "Initiate data infrastructure assessment",
        "Define pilot scope (recommend: 2 distribution centers)",
        "Establish governance framework"
      ]
    }
  }
}

function JsonPreview({ data }: { data: object }) {
  return (
    <pre className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-xs text-muted-foreground overflow-x-auto font-mono leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export function AgentOutputExplorer() {
  return (
    <section className="py-12 lg:py-16 border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card border-border/50 rounded-2xl shadow-xl shadow-black/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Agent Output Explorer
              </CardTitle>
              <p className="text-sm text-muted-foreground">Explore the detailed output from each AI agent in the workflow pipeline</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="intake" className="w-full">
                <TabsList className="w-full justify-start bg-secondary/30 rounded-xl p-1 h-auto flex-wrap gap-1">
                  {Object.entries(agentOutputs).map(([key, agent]) => (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 text-sm"
                    >
                      <agent.icon className="mr-2 h-4 w-4" />
                      {agent.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(agentOutputs).map(([key, agent]) => (
                  <TabsContent key={key} value={key} className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <agent.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{agent.title}</h3>
                        <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          Processing Complete
                        </Badge>
                      </div>
                    </div>
                    <JsonPreview data={agent.data} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
