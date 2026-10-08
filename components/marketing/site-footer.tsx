import Link from "next/link"

import { Logo } from "@/components/shared/logo"
import { ThemeSwitcher } from "@/components/shared/theme-switcher"
import { siteConfig } from "@/config/site"

type FooterColumn = {
  title: string
  links: { title: string; href: string }[]
}

const columns: FooterColumn[] = [
  {
    title: "Product",
    links: [{ title: "Dashboard", href: "/dashboard" }],
  },
  {
    title: "Resources",
    links: [
      { title: "Blog", href: "/blog" }, // module:blog
      { title: "GitHub", href: siteConfig.links.github },
    ],
  },
  {
    title: "Legal",
    links: [
      { title: "Terms", href: siteConfig.links.terms },
      { title: "Privacy", href: siteConfig.links.privacy },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-medium">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. Open source under
            the MIT license.
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  )
}
