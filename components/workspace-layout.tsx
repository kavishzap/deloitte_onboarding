"use client"

import { motion } from "framer-motion"
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
          <div className="lg:col-span-7">
            <AgentWorkflowTimeline />
          </div>
          <div className="lg:col-span-5">
            <ExecutiveOutputPanel />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
