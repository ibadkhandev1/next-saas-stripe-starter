import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildMetadata } from "@/lib/metadata"
import { formatDate } from "@/lib/utils"
import { getAllPosts, getTrashedPosts } from "@/modules/demo/posts"
import { demoUsers } from "@/modules/demo/users"

export const metadata = buildMetadata({
  title: "Users",
  noIndex: true,
})

export default function AdminUsersPage() {
  const allPosts = getAllPosts()
  const trashedIds = new Set(getTrashedPosts().map((post) => post.id))

  const rows = demoUsers.map((user) => {
    const posts = allPosts.filter((post) => post.authorId === user.id)
    return {
      user,
      total: posts.length,
      published: posts.filter(
        (post) => post.status === "published" && !trashedIds.has(post.id)
      ).length,
      drafts: posts.filter((post) => post.status === "draft").length,
      lastPost: posts.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      )[0],
    }
  })

  return (
    <PageContent>
      <PageHeader
        title="Users"
        description="Everyone who can write on this blog."
      />

      <SectionCard
        title="All users"
        description="Post counts come from the posts themselves, so they can't drift."
      >
        <ul className="divide-y">
          {rows.map(({ user, total, published, drafts, lastPost }) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center gap-4 py-4"
            >
              <UserAvatar user={user} className="size-9" />

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{user.name}</span>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {user.email}
                </span>
              </span>

              <span className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {published}
                  </span>{" "}
                  published
                </span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {drafts}
                  </span>{" "}
                  drafts
                </span>
                <span className="hidden text-muted-foreground sm:inline">
                  <span className="font-medium text-foreground tabular-nums">
                    {total}
                  </span>{" "}
                  total
                </span>
              </span>

              <span className="hidden text-sm text-muted-foreground lg:inline">
                {lastPost
                  ? `Last post ${formatDate(lastPost.updatedAt)}`
                  : "No posts yet"}
              </span>

              {/* UI only: role changes and invitations need a backend. */}
              <Button size="sm" variant="outline" disabled>
                Edit role
              </Button>
            </li>
          ))}
        </ul>
      </SectionCard>
    </PageContent>
  )
}
