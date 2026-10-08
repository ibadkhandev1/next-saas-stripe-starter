"use client"

import { useState } from "react"
import { toast } from "sonner"

import { AuthError, AuthField, SubmitButton } from "@/components/auth/auth-ui"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// UI only: the reset request is not sent. Wire `submit` to your backend.
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    toast.info("UI only — connect this form to your password reset endpoint.")
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

      <SubmitButton>Send reset link</SubmitButton>
    </form>
  )
}
