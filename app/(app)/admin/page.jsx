import Link from "next/link"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getAuthors, getPublishedBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn, formatDate } from "@/lib/utils"

const ACTIVITY_LIMIT = 6

export const metadata = buildMetadata({
  title: "Admin",
  noIndex: true,
})

export default async function AdminPage() {
  const [{ posts, total }, authors] = await Promise.all([
    getPublishedBlogs({ page: 1 }),
    getAuthors(),
  ])

  const activity = [...posts]
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    .slice(0, ACTIVITY_LIMIT)

  const stats = [
    { label: "Published", value: total },
    { label: "Authors", value: authors.length },
    { label: "Latest", value: activity[0] ? formatDate(activity[0].updatedAt ?? activity[0].createdAt) : "—" },
  ]

  return (
    <PageContent>
      <PageHeader
        title="Admin"
        description="Everything on the blog, across every author."
      />

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
        <SectionCard
          title="Recent activity"
          description="The latest change to any published post, whoever wrote it."
          footer={
            <Link
              href="/admin/posts"
              className="font-medium text-foreground hover:underline"
            >
              See all posts
            </Link>
          }
        >
          <ul className="divide-y">
            {activity.map((post) => (
              <li key={post.id} className="flex items-center gap-4 py-3">
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    Updated {formatDate(post.updatedAt ?? post.createdAt)}
                  </span>
                </span>
                <Badge variant="outline" className={cn("shrink-0")}>
                  {post.status}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className={cn(buttonVariants({ size: "sm" }), "px-3")}
        >
          Manage users
        </Link>
        <Link
          href="/admin/posts"
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "px-3"
          )}
        >
          All posts
        </Link>
      </div>
    </PageContent>
  )
}