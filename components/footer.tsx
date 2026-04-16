"use client"

import { motion } from "framer-motion"
import { Cpu } from "lucide-react"

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-border/50 bg-card/30"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Autonomous Business Transformation Copilot</p>
              <p className="text-xs text-muted-foreground">Built for Deloitte Internal AI Hackathon</p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center md:text-right">
            Prototype for internal innovation use only.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
