import { notFound } from "next/navigation"

import { PostEditor } from "@/components/dashboard/posts/post-editor"
import { getAccessToken } from "@/lib/auth/session"
import { getBlogById } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }) {
  const { id } = await params
  const post = await getBlogById(id, await getAccessToken())
  return buildMetadata({
    title: post ? `Edit ${post.title}` : "Post not found",
    noIndex: true,
  })
}

export default async function EditPostPage({ params }) {
  const { id } = await params
  const post = await getBlogById(id, await getAccessToken())
  if (!post) notFound()
  return <PostEditor post={post} />
}
