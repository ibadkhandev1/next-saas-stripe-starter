import Link from "next/link"

import { GridBackground } from "@/components/shared/grid-background"
import { Logo } from "@/components/shared/logo"
import { siteConfig } from "@/config/site"

// Split screen: the form on the left, a quiet panel of sample posts on the
// right. No session check — nothing gates these routes yet.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative flex flex-col items-center px-4 py-8">
        <GridBackground />

        <Logo className="relative" />

        <main className="relative flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {children}
        </main>

        <p className="relative text-center text-xs text-muted-foreground">
          By continuing, you agree to {siteConfig.name}&apos;s{" "}
          <Link
            href={siteConfig.links.terms}
            className="font-medium text-foreground hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={siteConfig.links.privacy}
            className="font-medium text-foreground hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>

      <AuthAside />
    </div>
  )
}

const SAMPLE_POSTS = [
  {
    title: "Ship the UI first, the backend later",
    category: "Education",
  },
  {
    title: "Writing a blog engine that stays fast",
    category: "Education",
  },
  {
    title: "The blog goes live",
    category: "News",
  },
]

function AuthAside() {
  return (
    <aside className="relative hidden items-center justify-center border-l bg-muted/30 p-12 lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-lines mask-[radial-gradient(60%_60%_at_50%_40%,black,transparent)] text-grid-border/60"
      />
      <div className="relative w-full max-w-sm">
        <p className="text-sm font-medium text-muted-foreground">
          From the blog
        </p>
        <ul className="mt-4 overflow-hidden rounded-lg border bg-card">
          {SAMPLE_POSTS.map((post) => (
            <li key={post.title} className="border-b p-4 last:border-b-0">
              <p className="font-medium text-balance">{post.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.category}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-pretty text-muted-foreground">
          Write, edit and publish from the dashboard. Everything you publish
          shows up on the blog straight away.
        </p>
      </div>
    </aside>
  )
}
