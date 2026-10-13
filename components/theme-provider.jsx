"use client"

import * as React from "react"

import {
  THEME_DARK,
  THEME_DARK_CLASS,
  THEME_DARK_QUERY,
  THEME_LIGHT,
  THEME_STORAGE_KEY,
  THEME_SYSTEM,
} from "@/lib/theme"

const ThemeContext = React.createContext(null)

/** Keys that should swallow the Ctrl/Cmd+D shortcut rather than toggle mid-typing. */
const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

const TOGGLE_HOTKEY = "d"

export function ThemeProvider({ children }) {
  // "system" until the effect reads what was actually stored. Nothing reads
  // this during SSR — the inline script in the layout owns the first paint, so
  // the markup never depends on the resolved theme.
  const [theme, setThemeState] = React.useState(THEME_SYSTEM)
  const [systemTheme, setSystemTheme] = React.useState(THEME_LIGHT)

  React.useEffect(() => {
    const media = window.matchMedia(THEME_DARK_QUERY)

    function syncSystemTheme() {
      setSystemTheme(media.matches ? THEME_DARK : THEME_LIGHT)
    }

    syncSystemTheme()
    media.addEventListener("change", syncSystemTheme)
    return () => media.removeEventListener("change", syncSystemTheme)
  }, [])

  const resolvedTheme =
    theme === THEME_SYSTEM ? systemTheme : theme

  // Applies the class whenever the resolved theme changes. `suppress` is passed
  // through so the CSS transitions are dropped for the frame the class flips on,
  // which is what next-themes did with disableTransitionOnChange.
  React.useEffect(() => {
    const root = document.documentElement
    const style = document.createElement("style")
    style.textContent =
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"

    root.classList.toggle(THEME_DARK_CLASS, resolvedTheme === THEME_DARK)
    root.style.colorScheme = resolvedTheme

    document.head.appendChild(style)
    // Force a reflow so the browser commits the "no transitions" state before
    // the style element is pulled back out.
    void document.body.offsetHeight
    const timeout = window.setTimeout(() => style.remove(), 1)

    return () => window.clearTimeout(timeout)
  }, [resolvedTheme])

  const setTheme = React.useCallback((next) => {
    setThemeState(next)
    try {
      if (next === THEME_SYSTEM) {
        // Clearing rather than storing "system" keeps the stored value honest.
        window.localStorage.removeItem(THEME_STORAGE_KEY)
      } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, next)
      }
    } catch {
      // Storage blocked (private mode): the theme still applies for this visit.
    }
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }, [resolvedTheme, setTheme])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.")
  }
  return context
}

function ThemeHotkey() {
  const { resolvedTheme, toggleTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.toLowerCase() !== TOGGLE_HOTKEY) return
      if (isTypingTarget(event.target)) return
      toggleTheme()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, toggleTheme])

  return null
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || TYPING_TAGS.has(target.tagName))
  )
}
