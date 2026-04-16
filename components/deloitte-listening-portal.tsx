"use client"

import { useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onClose: () => void
}

export function DeloitteListeningPortal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useLayoutEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!mounted || typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="deloitte-listener-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90]"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default border-0 bg-black/40 p-0 backdrop-blur-[4px]"
            aria-label="Dismiss voice copilot"
            onClick={onClose}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Deloitte voice copilot"
              initial={{ opacity: 0, scale: 0.65, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 12, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="pointer-events-auto relative w-full max-w-sm"
            >
              <div className="relative overflow-visible rounded-2xl border border-emerald-400/45 bg-background/95 p-6 shadow-[0_0_56px_-8px_rgba(52,211,153,0.55),0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 top-1.5 z-20 h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-[1px]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, rgba(52,211,153,0.15) 15%, rgba(163,230,53,0.35) 35%, rgba(52,211,153,0.25) 50%, transparent 65%, rgba(74,222,128,0.2) 80%, transparent 100%)",
                    animation: "spin 5s linear infinite",
                  }}
                />

                <motion.span
                  className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/50"
                  initial={{ scale: 0.6, opacity: 0.6 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/40"
                  initial={{ scale: 0.5, opacity: 0.45 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                />

                <div className="relative mx-auto flex h-[5.5rem] w-[5.5rem] items-center justify-center [perspective:14rem]">
                  <motion.div
                    className="h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85),0_0_6px_rgba(74,222,128,0.5)]"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{
                      rotateY: [0, 360],
                      filter: [
                        "drop-shadow(0 0 8px rgba(52,211,153,0.5))",
                        "drop-shadow(0 0 16px rgba(74,222,128,0.95))",
                        "drop-shadow(0 0 8px rgba(52,211,153,0.5))",
                      ],
                    }}
                    transition={{
                      rotateY: { duration: 2.4, repeat: Infinity, ease: "linear" },
                      filter: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                </div>

                <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                  Listening for your brief — speak naturally, I&apos;m processing context.
                </p>
                <motion.p
                  className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-500/90"
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  ● ● ●
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
