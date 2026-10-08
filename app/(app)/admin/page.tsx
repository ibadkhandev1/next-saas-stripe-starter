import Link from "next/link"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { buildMetadata } from "@/lib/metadata"
import { cn, formatDate } from "@/lib/utils"
import { getAllPosts, getPosts, getTrashedPosts } from "@/modules/demo/posts"
import { demoUsers } from "@/modules/demo/users"

export const metadata = buildMetadata({
  title: "Admin",
  noIndex: true,
})

export default function AdminPage() {
  const posts = getPosts()
  const trashed = getTrashedPosts()
  const published = posts.filter((post) => post.status === "published")
  const drafts = posts.filter((post) => post.status === "draft")

  // Newest activity across every author, including trashed so a delete shows up.
  const activity = getAllPosts().slice(0, 6)

  const stats = [
    { label: "Total posts", value: posts.length, href: "/admin/posts" },
    { label: "Published", value: published.length, href: "/admin/posts" },
    { label: "Drafts", value: drafts.length, href: "/admin/posts" },
    {
      label: "In trash",
      value: trashed.length,
      href: "/dashboard/posts/trash",
    },
    { label: "Users", value: demoUsers.length, href: "/admin/users" },
  ]

  return (
    <PageContent>
      <PageHeader
        title="Admin"
        description="Everything on the blog, across every author."
      />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border bg-card p-5 transition-colors hover:bg-muted/50"
          >
            <p className="text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] tabular-nums">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <SectionCard
          title="Recent activity"
          description="The latest change to any post, whoever wrote it."
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
                    href={`/dashboard/posts/${post.id}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {post.deletedAt ? "Trashed" : "Updated"}{" "}
                    {formatDate(post.deletedAt ?? post.updatedAt)}
                  </span>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0",
                    post.deletedAt && "border-destructive/40 text-destructive"
                  )}
                >
                  {post.deletedAt ? "Trash" : post.status}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <div className="mt-8">
        <Link
          href="/admin/users"
          className={cn(buttonVariants({ size: "sm" }), "px-3")}
        >
          Manage users
        </Link>
      </div>
    </PageContent>
  )
}
