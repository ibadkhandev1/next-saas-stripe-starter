"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { PostForm } from "@/components/dashboard/posts/post-form"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import type { Post, PostFormValues } from "@/modules/demo/posts"

// Demo mode: saving confirms with a toast and nothing is persisted. The values
// are already validated by PostForm, so a real submit just needs to send them.
export function PostEditor({ post }: { post: Post }) {
  const router = useRouter()

  function savePost(values: PostFormValues) {
    void values
    toast.success("Post saved (demo mode, not persisted).")
    router.push("/dashboard/posts")
  }

  return (
    <PageContent>
      <PageHeader title="Edit post" description={post.title} />

      {post.deletedAt && (
        <p className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          This post is in the trash. Restore it from the trash to publish it
          again.
        </p>
      )}

      <PostForm
        initialValues={{
          title: post.title,
          description: post.description,
          tags: post.tags.join(", "),
          category: post.category,
          featuredImage: post.featuredImage,
        }}
        submitLabel="Save changes"
        onSubmit={savePost}
        onCancel={() => router.push("/dashboard/posts")}
      />

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/dashboard/posts" className="hover:underline">
          Back to posts
        </Link>
      </p>
    </PageContent>
  )
}
