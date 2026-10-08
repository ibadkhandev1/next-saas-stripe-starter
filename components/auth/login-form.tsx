"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import {
  AuthDivider,
  AuthError,
  AuthField,
  AuthPasswordField,
  GoogleButton,
  SubmitButton,
} from "@/components/auth/auth-ui"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

// UI only: nothing is sent anywhere. `submit` is the one place to wire to your
// backend — return the error message and it renders in the form.
export function LoginForm({ initialError }: { initialError?: string | null }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)

  function submit(event: React.FormEvent) {
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
    toast.info("UI only — connect this form to your auth endpoint.")
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

        <SubmitButton>Log in</SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to {siteConfig.name}&apos;s terms.
        </p>
      </form>

      <AuthDivider />

      <GoogleButton />
    </div>
  )
}
