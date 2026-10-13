import { NewPostView } from "@/components/dashboard/posts/new-post-view"
import { buildMetadata } from "@/lib/metadata"
export const metadata = buildMetadata({
  title: "New post",
  noIndex: true,
})
export default function NewPostPage() {
  return <NewPostView />
}
