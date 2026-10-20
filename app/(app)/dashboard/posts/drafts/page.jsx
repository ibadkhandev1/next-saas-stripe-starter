import { FileText } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
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
  const { page: rawPage } = await searchParams
  const page = Math.max(Number(rawPage) || 1, 1)

  const { posts, pageCount } = await getMyDrafts({
    token: await getAccessToken(),
    page,
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

      {posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No drafts"
          description="Posts you start but do not publish collect here."
        />
      ) : (
        <>
          <PostsTable initialPosts={posts} />

          {pageCount > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                pageCount={pageCount}
                href={(n) =>
                  n > 1 ? `/dashboard/posts/drafts?page=${n}` : "/dashboard/posts/drafts"
                }
              />
            </div>
          )}
        </>
      )}
    </PageContent>
  )
}