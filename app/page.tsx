"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AIChatbot } from "@/components/ai-chatbot"
import { WorkspaceLayout } from "@/components/workspace-layout"
import { Footer } from "@/components/footer"
import { IntegrationsSection } from "@/components/integrations-section"
import { PageBootOverlay } from "@/components/page-boot-overlay"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PageBootOverlay />
      <Navbar />
      <main>
        <HeroSection />
        <AIChatbot />
        <WorkspaceLayout />
        <IntegrationsSection />
      </main>
      <Footer />
    </div>
  )
}
