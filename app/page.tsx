"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AIChatbot } from "@/components/ai-chatbot"
import { WorkspaceLayout } from "@/components/workspace-layout"
import { Footer } from "@/components/footer"
import { IntegrationsSection } from "@/components/integrations-section"
import { PageBootOverlay } from "@/components/page-boot-overlay"
import { SoftwareProposalProvider } from "@/components/software-proposal-context"
import { WorkflowWorkspaceProvider } from "@/components/workflow-workspace-context"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PageBootOverlay />
      <Navbar />
      <main>
        <WorkflowWorkspaceProvider>
          <HeroSection />
          <AIChatbot />
          <SoftwareProposalProvider>
            <WorkspaceLayout />
          </SoftwareProposalProvider>
          <IntegrationsSection />
        </WorkflowWorkspaceProvider>
      </main>
      <Footer />
    </div>
  )
}
