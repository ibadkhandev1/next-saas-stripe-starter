"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { GoogleButton } from "@/components/auth/auth-ui"
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from "@/config/constants"
import { apiErrorMessage, googleLogin } from "@/lib/api/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirect"
import { createGoogleCodeClient } from "@/lib/google-sign-in"

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
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)

  // Built once the SDK has loaded, so `request()` can be called straight from
  // the click handler with the user gesture still intact.
  const clientRef = useRef(null)

  const handleCode = useCallback(async (code) => {
    try {
      await googleLogin(code)
      toast.success("Signed in with Google.")
      router.replace(DEFAULT_LOGIN_REDIRECT)
      router.refresh()
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "Google sign-in failed. Please try again.")
      )
      setPending(false)
    }
  }, [router])

  const handleFailure = useCallback((error) => {
    setPending(false)
    toast.error(error.message)
  }, [])

  // Deliberately not async: awaiting anything here would spend the user
  // gesture and Chrome would block the popup.
  function handleClick() {
    if (pending) return

    if (!clientRef.current) {
      toast.error("Google sign-in is still loading. Try again in a moment.")
      return
    }

    setPending(true)
    clientRef.current.request()
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    let cancelled = false

    createGoogleCodeClient({
      clientId: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      onCode: handleCode,
      onError: handleFailure,
    })
      .then((client) => {
        if (cancelled) return
        clientRef.current = client
        setReady(true)
      })
      .catch((error) => {
        if (cancelled) return
        setReady(false)
        handleFailure(error)
      })

    return () => {
      cancelled = true
    }
  }, [handleCode, handleFailure])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <GoogleButton
      label={label}
      // Spinner while Google's SDK is warming up too, so a click during that
      // window explains itself instead of leaving a dead-looking button.
      pending={pending || !ready}
      disabled={pending}
      onClick={handleClick}
    />
  )
}