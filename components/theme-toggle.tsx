"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0 border-border/60 bg-background/80 hover:bg-accent"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        <img
          src={isDark ? "/icons/theme-sun.svg" : "/icons/theme-moon.svg"}
          alt=""
          width={20}
          height={20}
          className="size-5"
        />
      ) : (
        <span className="size-5" aria-hidden />
      )}
    </Button>
  )
}
