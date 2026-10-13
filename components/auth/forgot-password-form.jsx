"use client"
import { useState } from "react"
import { AuthError, AuthField, SubmitButton } from "@/components/auth/auth-ui"
import { api, apiErrorMessage } from "@/lib/api/client"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    setPending(true)
    try {
      await api.post("/auth/forgot-password", { email })
    } catch (requestError) {
      // A failure is not proof the mail failed, and saying otherwise would
      // also reveal which addresses exist. Same confirmation either way.
      console.error(
        "Password reset request failed:",
        apiErrorMessage(requestError, "unknown")
      )
    } finally {
      setPending(false)
      setSent(true)
    }
  }
  if (sent) {
    return (
      <p className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
        If that address has an account, we&apos;ve sent it a reset link. It
        expires in 15 minutes.
      </p>
    )
  }
  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <AuthError message={error} />

      <SubmitButton pending={pending}>Send reset link</SubmitButton>
    </form>
  )
}
