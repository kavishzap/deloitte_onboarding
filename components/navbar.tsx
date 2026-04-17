"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Cpu, Sparkles, Workflow } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Autonomous Business Transformation Copilot
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-medium px-3 py-1">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
            Hackathon Prototype
          </Badge>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-3 py-1">
            <Workflow className="mr-1.5 h-3 w-3" />
            n8n Connected
          </Badge>
          <Badge variant="outline" className="border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300 text-xs font-medium px-3 py-1">
            <Sparkles className="mr-1.5 h-3 w-3" />
            OpenAI Connected
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}
