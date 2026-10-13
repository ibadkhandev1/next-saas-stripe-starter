"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { PageContent, PageHeader } from "@/components/dashboard/page-header"
import { PostForm } from "@/components/dashboard/posts/post-form"
import { createPost, apiErrorMessage } from "@/lib/api/posts"

export function NewPostView() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(values, imageFile) {
    setSaving(true)
    try {
      const post = await createPost(values, imageFile)
      toast.success("Post created as a draft.")
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

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/dashboard/posts" className="hover:underline">
          Back to posts
        </Link>
      </p>
    </PageContent>
  )
}