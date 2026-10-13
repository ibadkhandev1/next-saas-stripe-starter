"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthPasswordField,
  GoogleButton,
  SubmitButton,
} from "@/components/auth/auth-ui"
import { api, apiErrorMessage } from "@/lib/api/client"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirect"
import { cn } from "@/lib/utils"
import { PASSWORD_MIN_LENGTH } from "@/config/constants"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Matches registerValidation in the backend.
const MIN_PASSWORD_LENGTH = PASSWORD_MIN_LENGTH
export function LoginForm({ initialError }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState(initialError ?? null)
  const [pending, setPending] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    setError(null)
    setPending(true)
    try {
      await api.post("/auth/login", { email, password })
      // Both cookies came back with the response, so the server layout can
      // read the session straight away.
      router.replace(DEFAULT_LOGIN_REDIRECT)
      router.refresh()
    } catch (requestError) {
      setPending(false)
      setError(apiErrorMessage(requestError, "Couldn't log you in."))
    }
  }
  return (
    <div className="grid gap-4">
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

        <div className="grid gap-2">
          <AuthPasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            revealed={revealed}
            onRevealChange={setRevealed}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Link
            href="/forgot-password"
            className={cn(
              "justify-self-end text-sm text-muted-foreground",
              "transition-colors hover:text-foreground"
            )}
          >
            Forgot password?
          </Link>
        </div>

        <AuthError message={error} />

        <SubmitButton pending={pending}>Log in</SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our terms.
        </p>
      </form>

      <AuthDivider />

      <GoogleButton />
    </div>
  )
}
