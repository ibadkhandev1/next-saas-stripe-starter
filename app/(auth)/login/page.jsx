import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { siteConfig } from "@/config/site"
import { buildMetadata } from "@/lib/metadata"
export const metadata = buildMetadata({
  title: "Log in",
  path: "/login",
  noIndex: true,
})
// A provider that redirects a failed or spent link back here puts the reason in
// `?error=`.
function describeError(error) {
  if (!error) return null
  if (error === "password-reset") {
    return "Your password has been changed. Log in with the new one."
  }
  if (error === "INVALID_TOKEN") {
    return "That link has expired or was already used. Ask for a new one."
  }
  return "Something went wrong. Please try again."
}
export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams
  return (
    <>
      <h1 className="mb-2 text-center text-xl font-semibold">Welcome back</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Log in to manage your posts on {siteConfig.name}.
      </p>

      <LoginForm initialError={describeError(error)} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  )
}
