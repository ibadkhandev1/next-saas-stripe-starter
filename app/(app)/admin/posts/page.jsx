import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { getPublishedBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"

export const metadata = buildMetadata({
  title: "All posts",
  noIndex: true,
})

export default async function AdminPostsPage() {
  // Published posts from every author, newest first. The public list hides
  // drafts and trashed posts, so an admin sees only what readers see here;
  // drafts and the trash have no admin-wide endpoint on the backend yet.
  const { posts, total } = await getPublishedBlogs({ page: 1 })

  return (
    <PageContent>
      <PageHeader
        title="All posts"
        description={`${total} published posts from every author.`}
      />

      <PostsTable initialPosts={posts} showAuthor />
    </PageContent>
  )
}
