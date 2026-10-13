import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { SectionCard } from "@/components/dashboard/section-card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/dashboard/empty-state"
import { getAuthors } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { formatDate } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Users",
  noIndex: true,
})

export default async function AdminUsersPage() {
  const authors = await getAuthors()

  return (
    <PageContent>
      <PageHeader
        title="Users"
        description="Everyone who can write on this blog."
      />

      <SectionCard
        title="Authors"
        description="Counted from published posts. The backend has no users endpoint yet, so names and roles aren't available here."
      >
        {authors.length === 0 ? (
          <EmptyState
            icon={Badge}
            title="No authors yet"
            description="Authors appear here once they've published a post."
          />
        ) : (
          <ul className="divide-y">
            {authors.map((author) => (
              <li
                key={author.id}
                className="flex flex-wrap items-center gap-4 py-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      Author {author.id.slice(-4).toUpperCase()}
                    </span>
                    <Badge variant="secondary">id {author.id.slice(-6)}</Badge>
                  </span>
                </span>

                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {author.postCount}
                  </span>{" "}
                  published
                </span>

                <span className="hidden text-sm text-muted-foreground lg:inline">
                  {author.lastPostAt
                    ? `Last post ${formatDate(author.lastPostAt)}`
                    : "No posts yet"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageContent>
  )
}