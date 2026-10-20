"use client"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { navIcons } from "@/components/dashboard/nav-icons"
import { ThemeSwitcher } from "@/components/shared/theme-switcher"
import { UserAvatar } from "@/components/shared/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api/client"
export function HeaderUserMenu({ user, items }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="cursor-pointer rounded-full transition-shadow outline-none hover:ring-4 hover:ring-neutral-900/5 focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:ring-4 data-popup-open:ring-neutral-900/5 dark:hover:ring-white/10 dark:data-popup-open:ring-white/10"
      >
        <UserAvatar user={user} fallbackClassName="text-xs" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="max-w-64">
            <span className="block truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="block truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => {
            const Icon = item.icon && navIcons[item.icon]
            return (
              <DropdownMenuItem
                key={item.href}
                nativeButton={false}
                render={<Link href={item.href} />}
              >
                {Icon && <Icon />}
                {item.title}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutItem />
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5 text-sm">
          <span>Theme</span>
          <ThemeSwitcher />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
// Shared by both menus. Goes through the proxy so the cookie is cleared on the
// same origin the browser holds it.
export function SignOutItem() {
  const router = useRouter()
  async function signOut() {
    try {
      await api.post("/auth/logout")
    } catch {
      toast.error("Couldn't reach the server.")
      return
    }
    // Both cookies are cleared upstream.
    toast.success("Signed out.")
    router.replace("/")
    router.refresh()
  }
  return (
    <DropdownMenuItem onClick={signOut}>
      <LogOut />
      Log out
    </DropdownMenuItem>
  )
}
