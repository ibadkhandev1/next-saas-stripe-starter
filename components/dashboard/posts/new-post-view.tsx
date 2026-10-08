"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { PostForm } from "@/components/dashboard/posts/post-form"
import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import type { PostFormValues } from "@/modules/demo/posts"

// Demo mode: nothing is persisted. Send the values to your backend in
// `createPost`, then redirect to the new post's page.
export function NewPostView() {
  const router = useRouter()

  function createPost(values: PostFormValues) {
    void values
    toast.success("Post created (demo mode, not saved).")
    router.push("/dashboard/posts")
  }

  return (
    <PageContent>
      <PageHeader
        title="New post"
        description="Draft it now, publish when it's ready."
      />

      <PostForm
        onSubmit={createPost}
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
