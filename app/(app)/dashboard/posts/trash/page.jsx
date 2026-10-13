import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { getAccessToken } from "@/lib/auth/session"
import { getTrashedBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"

export const metadata = buildMetadata({
  title: "Trash",
  noIndex: true,
})

export default async function TrashPage() {
  const { posts } = await getTrashedBlogs({ token: await getAccessToken() })

  return (
    <PageContent>
      <PageHeader
        title="Trash"
        description="Deleted posts. Restoring a post brings back everything it had."
      />

      <PostsTable initialPosts={posts} showTrashActions />
    </PageContent>
  )
}
