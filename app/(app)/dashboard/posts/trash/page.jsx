import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { ListSearch } from "@/components/dashboard/list-search"
import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { getAccessToken } from "@/lib/auth/session"
import { getTrashedBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"

export const metadata = buildMetadata({
  title: "Trash",
  noIndex: true,
})

export default async function TrashPage({ searchParams }) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search.trim() : ""

  const { posts } = await getTrashedBlogs({
    token: await getAccessToken(),
    search,
  })

  return (
    <PageContent>
      <PageHeader
        title="Trash"
        description="Deleted posts. Restoring a post brings back everything it had."
      />

      <ListSearch
        action="/dashboard/posts/trash"
        value={search}
        placeholder="Search the trash"
        label="Search the trash"
      />

      <div className="mt-6">
        <PostsTable initialPosts={posts} showTrashActions />
      </div>
    </PageContent>
  )
}