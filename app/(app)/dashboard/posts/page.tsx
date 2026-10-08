import { Trash2 } from "lucide-react"
import Link from "next/link"

import { PostsTable } from "@/components/dashboard/posts/posts-table"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { buttonVariants } from "@/components/ui/button"
import { buildMetadata } from "@/lib/metadata"
import { getPosts } from "@/modules/demo/posts"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Posts",
  noIndex: true,
})

export default function PostsPage() {
  const posts = getPosts()

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
