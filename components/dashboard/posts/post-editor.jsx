"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostForm } from "@/components/dashboard/posts/post-form"
import { apiErrorMessage, setPostStatus, updatePost } from "@/lib/api/posts"
import { POST_STATUSES } from "@/config/constants"

export function PostEditor({ post }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // A draft's primary action is to publish it. A post that is already out
  // there is edited, not re-published, so the primary action becomes a save.
  const isDraft = post.status === POST_STATUSES.DRAFT

  async function handleSubmit(values, imageFile, status) {
    setSaving(true)
    try {
      await updatePost(post.id, values, imageFile)

      // The edit endpoint only writes title, description and content, so a
      // status change is a separate call. It is only made when the status
      // actually differs, so an ordinary save stays a single request.
      const wantsDifferentStatus = status !== post.status
      if (wantsDifferentStatus) {
        await setPostStatus(post.id, status)
      }

      toast.success(
        status === POST_STATUSES.PUBLISHED ? "Post published." : "Post saved."
      )
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
        busy={saving}
        initialValues={{
          title: post.title,
          description: post.description,
          content: post.content,
          tags: post.tags,
          category: post.category,
          featuredImage: post.featuredImage,
        }}
        publishLabel={isDraft ? "Publish" : "Save changes"}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/posts")}
      />
    </PageContent>
  )
}