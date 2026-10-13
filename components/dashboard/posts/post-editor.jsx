"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostForm } from "@/components/dashboard/posts/post-form"
import { apiErrorMessage, updatePost } from "@/lib/api/posts"

export function PostEditor({ post }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(values, imageFile) {
    setSaving(true)
    try {
      await updatePost(post.id, values, imageFile)
      toast.success("Post saved.")
      router.push("/dashboard/posts")
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't save the post. Try again."))
      setSaving(false)
    }
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
        isEdit
        initialValues={{
          title: post.title,
          description: post.description,
          content: post.content,
          tags: post.tags.join(", "),
          category: post.category,
          featuredImage: post.featuredImage,
        }}
        submitLabel="Save changes"
        busy={saving}
        onSubmit={handleSubmit}
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