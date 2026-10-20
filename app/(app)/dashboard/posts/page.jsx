import Link from "next/link"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { Pagination } from "@/components/shared/pagination"
import { buttonVariants } from "@/components/ui/button"
import { getAccessToken } from "@/lib/auth/session"
import { getMyBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Posts",
  noIndex: true,
})

export default async function PostsPage({ searchParams }) {
  const { page: rawPage } = await searchParams
  const page = Math.max(Number(rawPage) || 1, 1)

  const { posts, pageCount } = await getMyBlogs({
    token: await getAccessToken(),
    page,
  })

  return (
    <PageContent>
      <PageHeader
        title="Posts"
        description="Everything you've published and drafted."
      >
        <Link
          href="/dashboard/posts/new"
          className={cn(buttonVariants({ size: "sm" }), "px-2.5")}
        >
          New post
        </Link>
      </PageHeader>

      <PostsTable initialPosts={posts} />

      {pageCount > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            pageCount={pageCount}
            href={(n) => (n > 1 ? `/dashboard/posts?page=${n}` : "/dashboard/posts")}
          />
        </div>
      )}
    </PageContent>
  )
}