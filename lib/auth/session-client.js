"use client"
// Refreshing the session from the browser.
//
// There is no token in JavaScript to keep: the backend sets the access token as
// an httpOnly cookie scoped to /api, so the browser sends it on every call by
// itself and injected script cannot read it.
//
// What is left for the client is the one thing a Server Component cannot do:
// trade the refresh cookie for a new access cookie when the access token (15
// minutes) has run out.
const REFRESH_PATH = "/api/auth/refresh"
// A signed-out visitor has no refresh cookie either, so this resolves to null
// and stays null until the next login.
let inflight = null
/** Trades the refresh cookie for a fresh access cookie. */
export function refreshSession() {
  // The backend rotates the refresh token on every call, so concurrent callers
  // must share one request — a second would present an already-rotated token.
  if (inflight) return inflight
  inflight = fetch(REFRESH_PATH, { method: "POST" })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      inflight = null
    })
  return inflight
}
