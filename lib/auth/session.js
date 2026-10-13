import "server-only"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { cache } from "react"
import { ACCESS_COOKIE, API_URL } from "@/config/constants"
import { LOGIN_PATH } from "@/lib/auth/redirect"
function toSessionUser(apiUser) {
  return {
    id: apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    image: apiUser.profile_image || null,
    bio: apiUser.bio ?? "",
    emailVerified: apiUser.isVerified,
  }
}
/**
 * The signed-in user, or null.
 *
 * Reads the access-token cookie and asks Express who it belongs to. There is
 * deliberately no refresh call here: the backend rotates refresh tokens, and a
 * Server Component cannot write the rotated cookie back, so refreshing on the
 * server would hand the browser a stale token and the next request would fail.
 * Refreshing is the browser's job — see lib/auth/session-client.js.
 *
 * Wrapped in cache() so a layout and its pages cost one upstream call between
 * them, not one each.
 */
export const getSession = cache(async () => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value
  if (!token || !API_URL) return null
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // One visitor's session must never be served to another.
      cache: "no-store",
    })
    if (!response.ok) return null
    const body = await response.json()
    if (!body?.data) return null
    return { user: toSessionUser(body.data) }
  } catch {
    // Express unreachable reads as signed out rather than a 500 for the reader.
    return null
  }
})
/**
 * The raw access token, for Server Components that call Express themselves
 * (lib/blogs.js). Kept separate from getSession so a caller has to ask for the
 * token deliberately rather than receive it alongside the user.
 */
export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null
}

/** For layouts and pages that only make sense when signed in. */
export async function requireSession() {
  const session = await getSession()
  if (!session) redirect(LOGIN_PATH)
  return session
}
/**
 * For admin-only routes. `notFound()` rather than a redirect: an admin URL
 * should not be advertised to anyone else, in the response or in search.
 *
 * Nobody holds the admin role yet — the backend defaults every new account to
 * "user" — so this 404s today and opens the moment someone is promoted.
 */
export async function requireRole(role) {
  const session = await requireSession()
  if (session.user.role !== role) notFound()
  return session
}
