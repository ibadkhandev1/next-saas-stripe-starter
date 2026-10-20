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

/**
 * The theme preference is an external store, not component state: it lives in
 * localStorage and can change from another tab or from the OS. Reading it with
 * useSyncExternalStore is what lets this component agree with the bootstrap
 * script in the layout instead of fighting it.
 *
 * That fight was a real bug. The script added the `dark` class before first
 * paint, then a `useEffect` that only knew its defaults resolved to light and
 * stripped the class back off — so a hard refresh of a dark page came back
 * white even though localStorage still said "dark".
 */

const listeners = new Set()

const ThemeContext = React.createContext(null)

function notify() {
  for (const listener of listeners) listener()
}

function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) ?? THEME_SYSTEM
  } catch {
    // Storage blocked (private mode). The system theme is a fine answer.
    return THEME_SYSTEM
  }
}

function readSystemTheme() {
  return window.matchMedia(THEME_DARK_QUERY).matches ? THEME_DARK : THEME_LIGHT
}

// Unknown on the server: the markup must not depend on it. The bootstrap
// script owns the first paint and React re-renders once the client snapshot
// arrives.
function readServerTheme() {
  return null
}

/**
 * One subscription covering all three inputs: another tab writing the key, the
 * OS flipping its preference, and this tab calling setTheme (which notifies
 * directly, because `storage` events only fire in *other* tabs).
 */
function subscribe(callback) {
  listeners.add(callback)

  const media = window.matchMedia(THEME_DARK_QUERY)
  media.addEventListener("change", callback)
  window.addEventListener("storage", callback)

  return () => {
    listeners.delete(callback)
    media.removeEventListener("change", callback)
    window.removeEventListener("storage", callback)
  }
}

export function ThemeProvider({ children }) {
  const theme = React.useSyncExternalStore(
    subscribe,
    readStoredTheme,
    readServerTheme
  )
  const systemTheme = React.useSyncExternalStore(
    subscribe,
    readSystemTheme,
    // The server cannot know the reader's OS preference; light is the neutral
    // placeholder because nothing paints from this before the client snapshot.
    () => THEME_LIGHT
  )

  const resolvedTheme = theme === THEME_SYSTEM || theme === null
    ? systemTheme
    : theme

  const setTheme = React.useCallback((next) => {
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
    // `storage` only fires in other tabs, so push this one by hand.
    notify()
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }, [resolvedTheme, setTheme])

  // Applies the class. Skipped until the stored preference is known, so the
  // bootstrap script's decision survives hydration instead of being overwritten
  // with a default.
  React.useEffect(() => {
    if (theme === null) return

    const root = document.documentElement
    const style = document.createElement("style")
    // Drops CSS transitions for the frame the class flips on, which is what
    // next-themes did with disableTransitionOnChange.
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
  }, [resolvedTheme, theme])

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

/** Keys that should swallow the Ctrl/Cmd+D shortcut rather than toggle mid-typing. */
const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

const TOGGLE_HOTKEY = "d"

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.")
  }
  return context
}

function ThemeHotkey() {
  const { toggleTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      // `key` is not guaranteed. It is undefined for IME composition events,
      // for synthetic events dispatched by extensions and assistive technology,
      // and for some layouts during key transition. Reading it unguarded threw
      // on the page and took the whole app down with it.
      if (typeof event.key !== "string") return
      if (event.key.toLowerCase() !== TOGGLE_HOTKEY) return
      if (isTypingTarget(event.target)) return
      toggleTheme()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggleTheme])

  return null
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || TYPING_TAGS.has(target.tagName))
  )
}