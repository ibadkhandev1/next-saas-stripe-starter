"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostForm } from "@/components/dashboard/posts/post-form"
import { apiErrorMessage, createPost } from "@/lib/api/posts"
import { POST_STATUSES } from "@/config/constants"

export function NewPostView() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(values, imageFile, status) {
    setSaving(true)
    try {
      const post = await createPost(values, imageFile, status)
      toast.success(
        status === POST_STATUSES.PUBLISHED
          ? "Post published."
          : "Saved as a draft."
      )
      router.push(`/dashboard/posts/${post._id}`)
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "Couldn't save the post. Try again.")
      )
      setSaving(false)
    }
  }

  return (
    <PageContent>
      <PageHeader
        title="New post"
        description="Draft it now, publish when it's ready."
      />

      <PostForm
        busy={saving}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/posts")}
      />
    </PageContent>
  )
}