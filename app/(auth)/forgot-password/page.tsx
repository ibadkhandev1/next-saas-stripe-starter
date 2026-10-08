import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center text-xl font-semibold">
        Reset your password
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Enter the email you signed up with and we&apos;ll send you a link to
        choose a new one.
      </p>

      <ForgotPasswordForm />
    </>
  )
}
