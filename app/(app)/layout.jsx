import { Geist } from "next/font/google"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getNavForRole } from "@/config/nav"
import { requireSession } from "@/lib/auth/session"
// Dashboard-only font; marketing keeps its own.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
export default async function AppLayout({ children }) {
  // Redirects to /login when there is no valid session.
  const { user } = await requireSession()
  return (
    <DashboardShell
      className={geist.variable}
      // Admin links only reach the markup for an admin. The sidebar and the
      // mobile sheet both render from this, and /admin still guards itself
      // separately with requireRole().
      nav={getNavForRole(user.role)}
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      {children}
    </DashboardShell>
  )
}
