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
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-ui"
import { api, apiErrorMessage } from "@/lib/api/client"
import { siteConfig } from "@/config/site"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
import { PASSWORD_MIN_LENGTH } from "@/config/constants"
const MIN_PASSWORD_LENGTH = PASSWORD_MIN_LENGTH
// A rough score for the strength meter: length plus character variety. Purely
// presentational — it never blocks submission.
function scorePassword(value) {
  if (value.length < MIN_PASSWORD_LENGTH) return 0
  let score = 1
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value) || /[^\w\s]/.test(value)) score++
  return Math.min(score, 4)
}
export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [registered, setRegistered] = useState(false)
  // Signing up is not signing in: the backend mails a verification link and
  // refuses login until it is followed. Saying so beats a redirect to a form
  // that would then reject the same credentials.
  if (registered) {
    return (
      <div className="grid gap-4">
        <p className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
          Your account is created. Check your inbox for the verification link,
          then log in.
        </p>
        <Link
          href="/login"
          className="w-fit text-sm font-semibold text-foreground hover:underline"
        >
          Go to log in
        </Link>
      </div>
    )
  }
  async function submit(event) {
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
    setPending(true)
    try {
      // multipart, not JSON: the backend mounts multer on this route and it
      // rejects a JSON body. The file is optional, so the field is left out.
      const form = new FormData()
      form.append("name", name)
      form.append("email", email)
      form.append("password", password)
      await api.post("/auth", form)
      // Registering does not sign anyone in: the backend mails a verification
      // link, and login is refused until that link is followed.
      setPending(false)
      setRegistered(true)
    } catch (requestError) {
      setPending(false)
      setError(apiErrorMessage(requestError, "Couldn't create your account."))
    }
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

        <SubmitButton pending={pending}>Create account</SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to {siteConfig.name}&apos;s terms.
        </p>
      </form>

      <AuthDivider />

      <GoogleButton
        label="Sign up with Google"
        onClick={() => toast.info("Connect this to your OAuth route.")}
      />
    </div>
  )
}
