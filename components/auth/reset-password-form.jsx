"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AuthError,
  AuthPasswordField,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-ui"
import { api, apiErrorMessage } from "@/lib/api/client"
import { PASSWORD_MIN_LENGTH } from "@/config/constants"
// Matches registerValidation in the backend.
const MIN_PASSWORD_LENGTH = PASSWORD_MIN_LENGTH
function scorePassword(value) {
  if (value.length < MIN_PASSWORD_LENGTH) return 0
  let score = 1
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value) || /[^\w\s]/.test(value)) score++
  return Math.min(score, 4)
}
export function ResetPasswordForm({ token }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    setError(null)
    setPending(true)
    try {
      await api.post("/auth/reset-password", { token, password })
      // Every session is revoked on reset, so land on login and say why.
      router.replace("/login?error=password-reset")
    } catch (requestError) {
      setPending(false)
      setError(apiErrorMessage(requestError, "Couldn't reset your password."))
    }
  }
  if (!token) {
    return (
      <p className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
        This link is missing its token. Request a new one from the{" "}
        <Link href="/forgot-password" className="underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    )
  }
  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <AuthPasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          revealed={revealed}
          onRevealChange={setRevealed}
          onChange={(event) => setPassword(event.target.value)}
        />
        {password.length > 0 && (
          <PasswordStrength score={scorePassword(password)} />
        )}
      </div>

      <AuthError message={error} />

      <SubmitButton pending={pending}>Change password</SubmitButton>
    </form>
  )
}
