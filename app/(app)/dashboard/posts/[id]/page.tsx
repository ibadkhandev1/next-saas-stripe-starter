import { notFound } from "next/navigation"

import { PostEditor } from "@/components/dashboard/posts/post-editor"
import { buildMetadata } from "@/lib/metadata"
import { getPost } from "@/modules/demo/posts"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const post = getPost(id)
  return buildMetadata({
    title: post ? `Edit ${post.title}` : "Post not found",
    noIndex: true,
  })
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const post = getPost(id)
  if (!post) notFound()

  return <PostEditor post={post} />
}
