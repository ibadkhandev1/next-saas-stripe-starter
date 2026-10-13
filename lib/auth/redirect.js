export const DEFAULT_LOGIN_REDIRECT = "/dashboard"

// Where an unauthenticated visitor is sent. Deliberately not
// DEFAULT_LOGIN_REDIRECT: that is the destination *after* a successful login.
// Redirecting a signed-out /dashboard request there would point it back at the
// guard that just rejected it, and the browser would loop until it gave up.
export const LOGIN_PATH = "/login"
// Only allow same-origin relative paths, so `?next=` can't be used as an open redirect.
export function getSafeRedirect(value) {
  if (typeof value !== "string") return DEFAULT_LOGIN_REDIRECT
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return DEFAULT_LOGIN_REDIRECT
  }
  return value
}
