import Link from "next/link"
import { HeaderUserMenu } from "@/components/marketing/header-user-menu"
import { SiteHeaderBackdrop } from "@/components/marketing/site-header-backdrop"
import { Logo } from "@/components/shared/logo"
import { buttonVariants } from "@/components/ui/button"
import { dashboardNav } from "@/config/nav"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirect"
import { getSession } from "@/lib/auth/session"
import { cn } from "@/lib/utils"
const links = [
  { title: "Blog", href: "/blog" }, // module:blog
]
const linkClassName =
  "rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-900/5 hover:text-foreground dark:text-white/90 dark:hover:bg-white/10"
export async function SiteHeader() {
  const session = await getSession()
  // Only three of the dashboard's items fit in this menu: the overview, the
  // account page, and whatever else you want one click away.
  const menuItems = dashboardNav
    .flatMap((section) => section.items)
    .map((item) =>
      item.href === DEFAULT_LOGIN_REDIRECT
        ? { ...item, title: "Dashboard" }
        : item
    )
    .filter(
      (item) =>
        item.href === DEFAULT_LOGIN_REDIRECT ||
        item.href === "/dashboard/settings/profile" ||
        item.href === "/admin/users"
    )
  return (
    <header className="sticky top-0 z-40 w-full">
      <SiteHeaderBackdrop />
      <div className="relative mx-auto grid h-14 max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-3 lg:px-4 xl:px-0">
        <Logo className="text-sm" />

        <nav className="hidden items-center sm:flex">
          {links.map((link) => (
            <Link key={link.title} href={link.href} className={linkClassName}>
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-2">
          {session ? (
            <HeaderUserMenu
              user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }}
              items={menuItems}
            />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }), "px-4")}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
