import Link from "next/link"

import { RegisterForm } from "@/components/auth/register-form"
import { buildMetadata } from "@/lib/metadata"

export const metadata = buildMetadata({
  title: "Sign up",
  path: "/register",
  noIndex: true,
})

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-2 text-center text-xl font-semibold">
        Create your account
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Start publishing in a minute.
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  )
}
