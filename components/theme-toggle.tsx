'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by rendering a skeleton placeholder until mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed top-4 left-4 md:top-8 md:left-8 lg:left-16 z-[9999] w-10 h-10 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="fixed top-4 left-4 md:top-8 md:left-8 lg:left-16 z-[9999] flex items-center justify-center w-10 h-10 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md hover:bg-white/80 dark:hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer text-foreground shadow-sm"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun className="absolute w-full h-full rotate-0 scale-100 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute w-full h-full rotate-90 scale-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100" />
      </div>
    </button>
  )
}
