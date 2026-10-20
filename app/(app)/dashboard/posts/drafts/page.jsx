import { FileText } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { ListSearch } from "@/components/dashboard/list-search"
import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { Pagination } from "@/components/shared/pagination"
import { buttonVariants } from "@/components/ui/button"
import { getAccessToken } from "@/lib/auth/session"
import { getMyDrafts } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Drafts",
  noIndex: true,
})

export default async function DraftsPage({ searchParams }) {
  const params = await searchParams
  const page = Math.max(Number(params.page) || 1, 1)
  const search = typeof params.search === "string" ? params.search.trim() : ""

  const { posts, pageCount } = await getMyDrafts({
    token: await getAccessToken(),
    page,
    search,
  })

  return (
    <PageContent>
      <PageHeader
        title="Drafts"
        description="Only you can see these. Publish one to put it on the blog."
      >
        <Link
          href="/dashboard/posts/new"
          className={cn(buttonVariants({ size: "sm" }), "px-2.5")}
        >
          New post
        </Link>
      </PageHeader>

      <ListSearch
        action="/dashboard/posts/drafts"
        value={search}
        placeholder="Search your drafts"
        label="Search your drafts"
      />

      {posts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FileText}
            title={search ? "No drafts match that" : "No drafts"}
            description={
              search
                ? "Try a different word, or clear the search."
                : "Posts you start but do not publish collect here."
            }
          />
        </div>
      ) : (
        <>
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
                    ? `/dashboard/posts/drafts?${string}`
                    : "/dashboard/posts/drafts"
                }}
              />
            </div>
          )}
        </>
      )}
    </PageContent>
  )
}