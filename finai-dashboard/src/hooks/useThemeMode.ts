import { useEffect, useLayoutEffect, useState } from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "finai_theme_v1"
const THEME_EVENT = "finai-theme-change"

function readThemeFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch (e) {
    // ignore
  }

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }

  return "light"
}

function writeThemeToStorage(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (e) {
    // ignore
  }
}

function broadcastTheme(theme: Theme) {
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }))
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

export function useThemeMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    return readThemeFromStorage()
  })

  useLayoutEffect(() => {
    applyTheme(theme)
    writeThemeToStorage(theme)
    broadcastTheme(theme)
  }, [theme])

  useEffect(() => {
    function handleThemeEvent(event: Event) {
      const nextTheme = (event as CustomEvent<Theme>).detail
      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme((current) => (current === nextTheme ? current : nextTheme))
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return
      const nextTheme = event.newValue
      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme((current) => (current === nextTheme ? current : nextTheme))
      }
    }

    window.addEventListener(THEME_EVENT, handleThemeEvent as EventListener)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeEvent as EventListener)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return { theme, setTheme, toggleTheme }
}
