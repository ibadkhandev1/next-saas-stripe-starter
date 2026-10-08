"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthPasswordField,
  GoogleButton,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-ui"
import { siteConfig } from "@/config/site"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

// A rough score for the strength meter: length plus character variety. Purely
// presentational — it never blocks submission.
function scorePassword(value: string) {
  if (value.length < MIN_PASSWORD_LENGTH) return 0
  let score = 1
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value) || /[^\w\s]/.test(value)) score++
  return Math.min(score, 4)
}

// UI only: nothing is sent anywhere. Wire `submit` to your backend.
export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!name.trim()) {
      setError("Enter your name.")
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setError(null)
    toast.info("UI only — connect this form to your auth endpoint.")
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <AuthField
          id="name"
          label="Name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div className="grid gap-2">
          <AuthPasswordField
            id="password"
            label="Password"
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

        <SubmitButton>Create account</SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to {siteConfig.name}&apos;s terms.
        </p>
      </form>

      <AuthDivider />

      <GoogleButton label="Sign up with Google" />
    </div>
  )
}
