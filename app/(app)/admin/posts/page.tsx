import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { buildMetadata } from "@/lib/metadata"
import { getPosts } from "@/modules/demo/posts"

export const metadata = buildMetadata({
  title: "All posts",
  noIndex: true,
})

export default function AdminPostsPage() {
  // Every author's posts, not just the signed-in user's.
  const posts = getPosts()

  return (
    <PageContent>
      <PageHeader
        title="All posts"
        description={`${posts.length} posts from every author.`}
      />

      <PostsTable initialPosts={posts} showAuthor />
    </PageContent>
  )
}
