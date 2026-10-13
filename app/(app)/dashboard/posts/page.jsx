import { Trash2 } from "lucide-react"
import Link from "next/link"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { buttonVariants } from "@/components/ui/button"
import { getAccessToken } from "@/lib/auth/session"
import { getMyBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Posts",
  noIndex: true,
})

export default async function PostsPage() {
  const { posts } = await getMyBlogs({ token: await getAccessToken() })

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

      <div className="mt-6">
        <Link
          href="/dashboard/posts/trash"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Trash2 className="size-4" />
          Trash
        </Link>
      </div>
    </PageContent>
  )
}
