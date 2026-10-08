import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { buildMetadata } from "@/lib/metadata"
import { getTrashedPosts } from "@/modules/demo/posts"

export const metadata = buildMetadata({
  title: "Trash",
  noIndex: true,
})

export default function TrashPage() {
  const posts = getTrashedPosts()

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
