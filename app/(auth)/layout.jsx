import Link from "next/link"
import { redirect } from "next/navigation"
import { GridBackground } from "@/components/shared/grid-background"
import { Logo } from "@/components/shared/logo"
import { siteConfig } from "@/config/site"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirect"
import { getSession } from "@/lib/auth/session"
import { getPublishedBlogs } from "@/lib/blogs"

// How many recent posts the marketing panel lists.
const ASIDE_POST_LIMIT = 3
// Split screen: the form on the left, a quiet panel of recent posts on the
// right. A signed-in visitor has no business here, so they go to the dashboard.
export default async function AuthLayout({ children }) {
  if (await getSession()) redirect(DEFAULT_LOGIN_REDIRECT)
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

/**
 * Real published posts, so the panel reflects the actual blog. Falls back to a
 * plain line when there is nothing published yet.
 */
async function AuthAside() {
  const { posts } = await getPublishedBlogs({ page: 1 })
  const recent = posts.slice(0, ASIDE_POST_LIMIT)

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

        {recent.length > 0 ? (
          <ul className="mt-4 overflow-hidden rounded-lg border bg-card">
            {recent.map((post) => (
              <li key={post.id} className="border-b p-4 last:border-b-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-medium text-balance hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.category}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Nothing published yet.
          </p>
        )}

        <p className="mt-6 text-sm text-pretty text-muted-foreground">
          Write, edit and publish from the dashboard. Everything you publish
          shows up on the blog straight away.
        </p>
      </div>
    </aside>
  )
}
