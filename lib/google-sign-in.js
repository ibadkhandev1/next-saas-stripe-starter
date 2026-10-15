import { GOOGLE_IDENTITY_SCRIPT } from "@/config/constants"

// Google's SDK is ~90 KB and the request to accounts.google.com can take
// several seconds, so it is warmed as soon as the auth screen mounts rather
// than on click. Every wait below is bounded, because a button that spins
// forever is worse than one that says what went wrong.
const SCRIPT_LOAD_TIMEOUT_MS = 15_000

// Backstop for Google never calling back.
//
// It exists because Google's popup watcher reads `popup.closed`, and that read
// is blocked when either page sets a cross-origin-opener policy — so dismissing
// the popup does not always produce an error_callback. Without this the button
// would spin until the reader gave up. Kept short enough to not feel broken,
// long enough to type a Google password.
const CODE_CALLBACK_TIMEOUT_MS = 90_000

const SCRIPT_FAILED_MESSAGE =
  "Couldn't load Google sign-in. Check your connection and try again."

const NO_CLIENT_MESSAGE =
  "Google sign-in didn't finish. If you closed the popup, try again; if your browser blocked it, allow popups for this site."

/**
 * The module-level promise makes the SDK load once per page no matter how many
 * buttons ask for it. Cleared after a failure so a later attempt retries
 * instead of caching the breakage.
 */
let scriptLoader

function loadScript() {
  if (scriptLoader) return scriptLoader

  scriptLoader = withTimeout(
    new Promise((resolve, reject) => {
      const ready = window.google?.accounts?.oauth2
      if (ready) {
        resolve(ready)
        return
      }

      const script = document.createElement("script")
      script.src = GOOGLE_IDENTITY_SCRIPT
      script.async = true
      script.defer = true
      script.onload = () => {
        const oauth2 = window.google?.accounts?.oauth2
        if (oauth2) resolve(oauth2)
        else reject(new Error(SCRIPT_FAILED_MESSAGE))
      }
      script.onerror = () => reject(new Error(SCRIPT_FAILED_MESSAGE))
      document.head.appendChild(script)
    }),
    SCRIPT_LOAD_TIMEOUT_MS,
    SCRIPT_FAILED_MESSAGE
  ).catch((error) => {
    scriptLoader = undefined
    throw error
  })

  return scriptLoader
}

/** Warm the cache so the first click doesn't wait on the network. */
export function preloadGoogleSignIn() {
  return loadScript().catch(() => {
    // Best effort. A click reports the real failure.
  })
}

/**
 * Builds a code client with its callbacks already wired, so the caller can
 * invoke `request()` synchronously from a click handler.
 *
 * That is the whole point: opening a popup needs the user gesture intact, and
 * awaiting anything first — even an already-resolved promise — spends it, so
 * Chrome blocks the popup and nothing appears.
 *
 * `onCode` and `onError` are therefore called from Google's own callbacks, not
 * from a promise the component awaits.
 */
export async function createGoogleCodeClient({
  clientId,
  scope,
  onCode,
  onError,
}) {
  const oauth2 = await loadScript()

  let settled = false
  // Backstop for Google never calling back at all — which is what a popup
  // blocked by the browser looks like from here.
  const timeoutId = setTimeout(() => {
    if (!settled) onError?.(new Error(NO_CLIENT_MESSAGE))
  }, CODE_CALLBACK_TIMEOUT_MS)

  const finish = (handler) => (payload) => {
    settled = true
    clearTimeout(timeoutId)
    handler(payload)
  }

  const client = oauth2.initCodeClient({
    client_id: clientId,
    scope,
    ux_mode: "popup",
    callback: finish((response) => {
      if (response.error) {
        // A dismissed popup is a cancellation, not a failure worth shouting about.
        if (response.error !== "popup_closed_by_user") {
          onError?.(new Error(response.error_description ?? response.error))
        }
        return
      }
      onCode(response.code)
    }),
    error_callback: finish((error) => {
      if (error.type !== "popup_closed_by_user") {
        onError?.(
          new Error(
            GOOGLE_ERROR_MESSAGES[error.type] ?? "Google sign-in failed."
          )
        )
      }
    }),
  })

  return {
    request() {
      // Google's docs are inconsistent about this method's name between
      // revisions of the reference, so use whichever the loaded bundle has.
      if (typeof client.requestCode === "function") client.requestCode()
      else if (typeof client.requestAccessToken === "function")
        client.requestAccessToken()
      else onError?.(new Error(NO_CLIENT_MESSAGE))
    },
  }
}

const GOOGLE_ERROR_MESSAGES = Object.freeze({
  popup_failed_to_open:
    "Your browser blocked the sign-in popup. Allow popups for this site, then try again.",
  popup_closed: "Google sign-in was cancelled.",
})

function withTimeout(promise, ms, message) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}