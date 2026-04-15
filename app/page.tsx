"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AIChatbot } from "@/components/ai-chatbot"
import { WorkspaceLayout } from "@/components/workspace-layout"
import { AgentOutputExplorer } from "@/components/agent-output-explorer"
import { BusinessValueSection } from "@/components/business-value-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { IntegrationPanel } from "@/components/integration-panel"
import { DemoSection } from "@/components/demo-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AIChatbot />
        <WorkspaceLayout />
        <AgentOutputExplorer />
        <BusinessValueSection />
        <HowItWorksSection />
        <IntegrationPanel />
        <DemoSection />
      </main>
      <Footer />
    </div>
  )
}
