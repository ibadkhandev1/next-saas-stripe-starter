import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { buildMetadata } from "@/lib/metadata"
export const metadata = buildMetadata({
  title: "Reset password",
  path: "/reset-password",
  noIndex: true,
})
export default async function ResetPasswordPage({ searchParams }) {
  // The token arrives in the query string from the emailed link.
  const { token } = await searchParams
  return (
    <>
      <h1 className="mb-2 text-center text-xl font-semibold">
        Choose a new password
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Setting a new one signs out every device, then you can log in again.
      </p>

      <ResetPasswordForm token={token ?? ""} />
    </>
  )
}
