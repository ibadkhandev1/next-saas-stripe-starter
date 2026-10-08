import { Geist } from "next/font/google"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { dashboardNav } from "@/config/nav"
import { getSession } from "@/modules/demo/data"

// Dashboard-only font; marketing keeps its own.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // No session check: there is no auth backend, so the dashboard is open.
  // Add `requireSession()` here once you have one.
  const { user } = getSession()

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
