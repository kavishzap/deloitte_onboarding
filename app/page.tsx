"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AIChatbot } from "@/components/ai-chatbot"
import { WorkspaceLayout } from "@/components/workspace-layout"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AIChatbot />
        <WorkspaceLayout />
      </main>
      <Footer />
    </div>
  )
}
