import { FileText, PenLine } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getAccessToken } from "@/lib/auth/session"
import { getMyBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

const RECENT_POST_LIMIT = 3

export const metadata = buildMetadata({
  title: "Overview",
  noIndex: true,
})

export default async function DashboardPage() {
  const { posts, total } = await getMyBlogs({ token: await getAccessToken() })

  const published = posts.filter((post) => post.status === "published")
  const drafts = posts.filter((post) => post.status === "draft")
  const recent = [...posts]
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    .slice(0, RECENT_POST_LIMIT)

  const stats = [
    { label: "Posts", value: total },
    { label: "Published", value: published.length },
    { label: "Drafts", value: drafts.length },
  ]

  return (
    <PageContent>
      <PageHeader title="Overview" description="Your blog at a glance." />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-5">
            <p className="text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Recently updated
          </h2>
          <Link
            href="/dashboard/posts"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            All posts
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No posts yet"
            description="Create your first post to get started."
          />
        ) : (
          <ul className="overflow-hidden rounded-lg border">
            {recent.map((post) => (
              <li key={post.id} className="border-b last:border-b-0">
                <Link
                  href={`/dashboard/posts/${post.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {post.title}
                    </span>
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {post.description}
                    </span>
                  </span>
                  <Badge variant="secondary" className="shrink-0">
                    {post.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8">
        <Link
          href="/dashboard/posts/new"
          className={cn(buttonVariants({ size: "sm" }), "px-3")}
        >
          <PenLine />
          Write a post
        </Link>
      </div>
    </PageContent>
  )
}