import { api, apiErrorMessage } from "@/lib/api/client"

/**
 * The header Google's popup code flow requires.
 *
 * The backend rejects any request without it: a cross-site form can POST to our
 * origin but cannot set a custom header, so this doubles as the CSRF guard that
 * stops someone feeding a code they captured elsewhere into our login.
 */
const CSRF_HEADER = "X-Requested-With"
const CSRF_VALUE = "XMLHttpRequest"

/**
 * Hands Google's one-time authorization code to the backend, which trades it
 * for a verified profile using its own client secret and sets the same session
 * cookies the password login does.
 */
export async function googleLogin(code) {
  const { data } = await api.post(
    "/auth/google",
    { code },
    { headers: { [CSRF_HEADER]: CSRF_VALUE } }
  )
  return data.data
}

export { apiErrorMessage }