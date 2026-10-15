import { GOOGLE_IDENTITY_SCRIPT } from "@/config/constants"

/**
 * Loads Google's Identity Services bundle once per page and resolves when
 * `google.accounts.oauth2` is ready.
 *
 * Loaded on demand rather than with <Script> in the layout, so the ~90 KB
 * bundle is only fetched by someone who actually reaches the auth screens. The
 * module-level promise is what makes it load once no matter how many buttons
 * ask for it.
 */
let loader

function loadScript() {
  if (loader) return loader

  loader = new Promise((resolve, reject) => {
    const alreadyLoaded = window.google?.accounts?.oauth2
    if (alreadyLoaded) {
      resolve(alreadyLoaded)
      return
    }

    const script = document.createElement("script")
    script.src = GOOGLE_IDENTITY_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => {
      const oauth2 = window.google?.accounts?.oauth2
      if (oauth2) resolve(oauth2)
      else reject(new Error("Google sign-in loaded but is unavailable."))
    }
    script.onerror = () =>
      reject(new Error("Couldn't reach Google. Check your connection."))
    document.head.appendChild(script)
  }).catch((error) => {
    // Let the next click retry instead of caching the failure forever.
    loader = undefined
    throw error
  })

  return loader
}

/**
 * Opens Google's account chooser and calls back with the authorization code.
 *
 * `ux_mode: 'popup'` keeps the reader on this page — no redirect dance, and the
 * code comes back through the callback instead of the URL.
 */
export async function requestGoogleCode({ clientId, scope, onCode, onError }) {
  const oauth2 = await loadScript()

  return new Promise((resolve) => {
    const client = oauth2.initCodeClient({
      client_id: clientId,
      scope,
      ux_mode: "popup",
      callback: (response) => {
        if (response.error) {
          // A closed popup is a cancellation, not a failure worth shouting about.
          if (response.error !== "popup_closed_by_user") {
            onError?.(
              new Error(response.error_description ?? response.error)
            )
          }
          resolve(null)
          return
        }
        onCode(response.code)
        resolve(response.code)
      },
      error_callback: (error) => {
        if (error.type !== "popup_closed_by_user") {
          onError?.(new Error(GOOGLE_ERROR_MESSAGES[error.type] ?? "Google sign-in failed."))
        }
        resolve(null)
      },
    })

    // Google's own docs are inconsistent about this method's name between
    // revisions of the reference, so use whichever the loaded bundle exposes.
    if (typeof client.requestCode === "function") client.requestCode()
    else client.requestAccessToken()
  })
}

const GOOGLE_ERROR_MESSAGES = Object.freeze({
  popup_failed_to_open:
    "Your browser blocked the Google sign-in popup. Allow popups for this site and try again.",
  popup_closed: "Google sign-in was cancelled.",
})