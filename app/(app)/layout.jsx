import { Geist } from "next/font/google"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { dashboardNav } from "@/config/nav"
import { requireSession } from "@/lib/auth/session"
// Dashboard-only font; marketing keeps its own.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
export default async function AppLayout({ children }) {
  // Redirects to /login when there is no valid session.
  const { user } = await requireSession()
  return (
    <DashboardShell
      className={geist.variable}
      nav={dashboardNav}
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
