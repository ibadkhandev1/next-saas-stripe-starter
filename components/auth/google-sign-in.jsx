"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { GoogleButton } from "@/components/auth/auth-ui"
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from "@/config/constants"
import { apiErrorMessage, googleLogin } from "@/lib/api/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirect"
import { requestGoogleCode } from "@/lib/google-sign-in"

/**
 * Signs in with Google.
 *
 * Renders nothing when no client id is configured: a button that cannot work is
 * worse than no button. Google's popup returns a one-time authorization code,
 * which the backend exchanges for a verified profile using its own secret and
 * sets the same session cookies as the password login — so from here on this is
 * an ordinary session.
 */
export function GoogleSignIn({ label = "Continue with Google" }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  if (!GOOGLE_CLIENT_ID) return null

  async function handleClick() {
    if (pending) return
    setPending(true)

    try {
      const code = await requestGoogleCode({
        clientId: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        onError: (error) => toast.error(error.message),
      })

      // A cancelled popup resolves with no code. Leave the reader where they are
      // without an error.
      if (!code) {
        setPending(false)
        return
      }

      await googleLogin(code)
      toast.success("Signed in with Google.")
      router.replace(DEFAULT_LOGIN_REDIRECT)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Google sign-in failed. Try again."))
      setPending(false)
    }
  }

  return (
    <GoogleButton
      label={label}
      pending={pending}
      disabled={pending}
      onClick={handleClick}
    />
  )
}