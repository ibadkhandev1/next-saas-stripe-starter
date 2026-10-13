"use client"
import { House } from "lucide-react"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { UserMenu } from "@/components/dashboard/user-menu"
export function Sidebar({ nav, user, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 pt-2 pb-3">
        <div className="flex animate-in flex-col gap-px duration-200 fade-in slide-in-from-left-4">
          <SidebarNav sections={nav} onNavigate={onNavigate} />
        </div>
      </div>

      <div className="flex flex-col gap-1 p-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 font-medium tracking-[-0.02em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <House className="size-4 shrink-0" />
          Back to homepage
        </Link>
        <UserMenu user={user} />
      </div>
    </div>
  )
}
