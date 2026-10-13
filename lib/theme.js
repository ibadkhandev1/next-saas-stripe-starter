/**
 * Theme bootstrap, shared by the inline script in the root layout and the
 * client provider that drives the toggle.
 *
 * This replaces `next-themes`, which renders its own <script> from inside a
 * React component. React 19 warns about that on every page ("Encountered a
 * script tag while rendering React component"), and no released or beta
 * version of that library avoids it. Owning ~20 lines of it keeps the app free
 * of that error, and keeps the no-flash guarantee: the script runs in <head>
 * before the body paints, so the correct class is on <html> first render.
 */

/** localStorage key. Matches the default next-themes used, so old preferences survive. */
export const THEME_STORAGE_KEY = "theme"

export const THEME_ATTRIBUTE = "class"

/** The one class that toggles dark mode, per globals.css. */
export const THEME_DARK_CLASS = "dark"

export const THEME_LIGHT = "light"
export const THEME_DARK = "dark"
export const THEME_SYSTEM = "system"

export const THEME_OPTIONS = Object.freeze([
  { value: THEME_LIGHT, label: "Light" },
  { value: THEME_DARK, label: "Dark" },
  { value: THEME_SYSTEM, label: "System" },
])

/**
 * The inline script, as a string, for the layout's <head>.
 *
 * It only reads and applies — it never renders. Failures are swallowed: a
 * blocked localStorage (private mode, strict cookie policy) must not block the
 * page, and the worst case is the system theme.
 */
export const THEME_BOOTSTRAP_SCRIPT = `;(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) || ${JSON.stringify(THEME_SYSTEM)};
    var isDark =
      stored === ${JSON.stringify(THEME_DARK)} ||
      (stored === ${JSON.stringify(THEME_SYSTEM)} &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.classList.toggle(${JSON.stringify(THEME_DARK_CLASS)}, isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  } catch (error) {}
})();`

/** The media query that decides what "system" means right now. */
export const THEME_DARK_QUERY = "(prefers-color-scheme: dark)"
