"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

/**
 * Full-viewport entrance sequence on first paint (skipped when prefers-reduced-motion).
 * Uses Web Speech API for a short calibration line; distinct from the voice-copilot modal UI.
 */
export function PageBootOverlay() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setVisible(false)
      return
    }

    const dismiss = window.setTimeout(() => setVisible(false), 4000)

    const speakBootLine = () => {
      if (!("speechSynthesis" in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(
        "System calibrating. Checking all AI model status."
      )
      u.rate = 0.88
      u.pitch = 1
      u.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            /Google|Microsoft|Natural|Zira|Samantha|Daniel/i.test(v.name)
        ) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"))
      if (preferred) u.voice = preferred
      window.speechSynthesis.speak(u)
    }

    const speakDelay = window.setTimeout(speakBootLine, 400)

    return () => {
      clearTimeout(dismiss)
      clearTimeout(speakDelay)
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-boot"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[rgba(2,8,6,0.97)]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(14px)",
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          aria-hidden
        >
          {/* Subtle tactical grid */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.14 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              backgroundImage: `
                linear-gradient(rgba(52,211,153,0.35) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52,211,153,0.35) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Radial vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_72%,#020806_100%)]" />

          {/* Corner brackets */}
          <HudCorner className="left-6 top-6 sm:left-10 sm:top-10" delay={0.05} />
          <HudCorner className="right-6 top-6 sm:right-10 sm:top-10" delay={0.1} flipH />
          <HudCorner className="left-6 bottom-6 sm:left-10 sm:bottom-10" delay={0.15} flipV />
          <HudCorner
            className="right-6 bottom-6 sm:right-10 sm:bottom-10"
            delay={0.2}
            flipH
            flipV
          />

          {/* Scan line — single pass */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent shadow-[0_0_24px_rgba(52,211,153,0.6)]"
            initial={{ top: "-5%" }}
            animate={{ top: "105%" }}
            transition={{ duration: 1.15, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Center stack */}
          <div className="relative flex h-[min(52vw,16rem)] w-[min(52vw,16rem)] items-center justify-center">
            {/* Outer dashed ring — CW */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-emerald-500/35"
              initial={{ opacity: 0, scale: 0.65, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              transition={{
                opacity: { duration: 0.45 },
                scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                rotate: { duration: 3.2, ease: "linear", repeat: Infinity },
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-[12%] rounded-full border border-dotted border-emerald-400/30 shadow-[inset_0_0_32px_rgba(52,211,153,0.08)]"
              initial={{ opacity: 0, scale: 0.75, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: -360 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.08 },
                scale: { duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
                rotate: { duration: 5, ease: "linear", repeat: Infinity },
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-[6%]"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, ease: "linear", repeat: Infinity }}
            >
              <div className="relative h-full w-full">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <div
                    key={deg}
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div className="mt-[2%] h-[8%] w-px rounded-full bg-emerald-400/55" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Core: horizontal “lens” bar + flipping bead */}
            <div className="relative z-10 flex flex-col items-center gap-3 [perspective:12rem]">
              <motion.div
                className="h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.65)]"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9),0_0_4px_rgba(52,211,153,0.8)]"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ scale: 0, rotateX: 0 }}
                animate={{ scale: 1, rotateX: [0, 360] }}
                transition={{
                  scale: { delay: 0.35, type: "spring", stiffness: 380, damping: 18 },
                  rotateX: { duration: 1.8, repeat: Infinity, ease: "linear" },
                }}
              />
            </div>

            {/* Soft pulse ring */}
            <motion.span
              className="pointer-events-none absolute inset-[18%] rounded-full border border-emerald-400/30"
              initial={{ scale: 0.85, opacity: 0.5 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
          </div>

          {/* Caption */}
          <motion.div
            className="pointer-events-none absolute bottom-[18%] left-0 right-0 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.55em] text-emerald-500/90">
              System calibrating
            </p>
            <motion.p
              className="mt-1.5 text-[11px] tracking-wide text-muted-foreground/80"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              Checking all AI model status
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function HudCorner({
  className,
  delay,
  flipH,
  flipV,
}: {
  className: string
  delay: number
  flipH?: boolean
  flipV?: boolean
}) {
  const sx = flipH ? -1 : 1
  const sy = flipV ? -1 : 1
  return (
    <div
      className={`pointer-events-none absolute h-14 w-14 sm:h-16 sm:w-16 ${className}`}
      style={{ transform: `scale(${sx}, ${sy})` }}
    >
      <motion.div
        className="absolute left-0 top-0 h-px origin-left bg-gradient-to-r from-emerald-400 to-emerald-400/20"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "3.25rem", opacity: 1 }}
        transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute left-0 top-0 w-px origin-top bg-gradient-to-b from-emerald-400 to-emerald-400/20"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "3.25rem", opacity: 1 }}
        transition={{ delay: delay + 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
