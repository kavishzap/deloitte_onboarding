"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { AgentWorkflowTimeline } from "@/components/agent-workflow-timeline"
import { ExecutiveOutputPanel } from "@/components/executive-output-panel"
import {
  PLANNING_KANBAN_SECTION_ID,
  PlanningKanbanBoard,
} from "@/components/planning-kanban-board"
import { SoftwareProposalFullSection } from "@/components/software-proposal-full-section"
import { useSoftwareProposal } from "@/components/software-proposal-context"

export function WorkspaceLayout() {
  const { proposalResult, planningBoard } = useSoftwareProposal()
  const lastScrolledBoardRef = useRef<string | null>(null)

  useEffect(() => {
    if (!planningBoard) {
      lastScrolledBoardRef.current = null
      return
    }
    const key = `${planningBoard.boardTitle}-${planningBoard.tasks.length}-${planningBoard.columns.length}`
    if (lastScrolledBoardRef.current === key) return
    const id = window.setTimeout(() => {
      document.getElementById(PLANNING_KANBAN_SECTION_ID)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      lastScrolledBoardRef.current = key
    }, 150)
    return () => window.clearTimeout(id)
  }, [planningBoard])

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <AgentWorkflowTimeline />
          </div>
          <div className="lg:col-span-5">
            <ExecutiveOutputPanel />
          </div>
        </motion.div>
      </div>

      {proposalResult !== null && proposalResult !== undefined && (
        <SoftwareProposalFullSection rawData={proposalResult} />
      )}

      {planningBoard ? <PlanningKanbanBoard board={planningBoard} /> : null}
    </section>
  )
}
