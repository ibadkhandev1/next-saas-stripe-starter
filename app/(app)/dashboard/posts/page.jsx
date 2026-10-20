import Link from "next/link"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { ListSearch } from "@/components/dashboard/list-search"
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
  const params = await searchParams
  const page = Math.max(Number(params.page) || 1, 1)
  const search = typeof params.search === "string" ? params.search.trim() : ""

  const { posts, pageCount } = await getMyBlogs({
    token: await getAccessToken(),
    page,
    search,
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

      <ListSearch
        action="/dashboard/posts"
        value={search}
        placeholder="Search your posts"
        label="Search your posts"
      />

      <div className="mt-6">
        <PostsTable initialPosts={posts} />
      </div>

      {pageCount > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            pageCount={pageCount}
            href={(n) => {
              const query = new URLSearchParams()
              if (n > 1) query.set("page", String(n))
              if (search) query.set("search", search)
              const string = query.toString()
              return string
                ? `/dashboard/posts?${string}`
                : "/dashboard/posts"
            }}
          />
        </div>
      )}
    </PageContent>
  )
}