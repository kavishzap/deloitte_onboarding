"use client"

import { motion } from "framer-motion"
import { BusinessInputPanel } from "@/components/business-input-panel"
import { AgentWorkflowTimeline } from "@/components/agent-workflow-timeline"
import { ExecutiveOutputPanel } from "@/components/executive-output-panel"

export function WorkspaceLayout() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Column - Business Input */}
          <div className="lg:col-span-3">
            <BusinessInputPanel />
          </div>
          
          {/* Center Column - Agent Workflow */}
          <div className="lg:col-span-5">
            <AgentWorkflowTimeline />
          </div>
          
          {/* Right Column - Executive Output */}
          <div className="lg:col-span-4">
            <ExecutiveOutputPanel />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
