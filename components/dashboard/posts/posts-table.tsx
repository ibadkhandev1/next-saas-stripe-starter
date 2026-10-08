"use client"

import { Eye, FileText, Pencil, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/dashboard/empty-state"
import { UserAvatar } from "@/components/shared/user-avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils"
import { blogCategories } from "@/config/blog"
import { parseTags, type Post } from "@/modules/demo/posts"
import { getUser, getUserName } from "@/modules/demo/users"

// Demo mode: create, edit, delete and restore all update local state and say
// so in a toast. Each action is one function here, so a real mutation replaces
// a single call.
export function PostsTable({
  initialPosts,
  showTrashActions = false,
  showAuthor = false,
}: {
  initialPosts: Post[]
  // Trashed posts offer restore instead of edit.
  showTrashActions?: boolean
  // The admin views list every author's posts, so they show who wrote each one.
  showAuthor?: boolean
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null)
  const [confirmPhrase, setConfirmPhrase] = useState("")
  const [, startTransition] = useTransition()

  const trashable = showTrashActions

  function deletePost(post: Post) {
    startTransition(() => {
      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? { ...item, deletedAt: new Date(), status: "draft" as const }
            : item
        )
      )
      setPendingDelete(null)
      setConfirmPhrase("")
      toast.success(`"${post.title}" moved to the trash.`)
    })
  }

  function restorePost(post: Post) {
    startTransition(() => {
      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id ? { ...item, deletedAt: null } : item
        )
      )
      toast.success(`"${post.title}" restored.`)
    })
  }

  const confirmPhraseMatches = confirmPhrase === postTitlePhrase()

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={trashable ? Trash2 : FileText}
        title={trashable ? "The trash is empty" : "No posts yet"}
        description={
          trashable
            ? "Deleted posts show up here, and can be restored."
            : "Create your first post to get started."
        }
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full border-collapse text-left">
          <thead className="border-b bg-muted/40">
            <tr className="text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Post
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 font-medium sm:table-cell"
              >
                Status
              </th>
              {showAuthor && (
                <th
                  scope="col"
                  className="hidden px-4 py-3 font-medium lg:table-cell"
                >
                  Author
                </th>
              )}
              <th
                scope="col"
                className="hidden px-4 py-3 font-medium md:table-cell"
              >
                Updated
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-medium">{post.title}</span>
                    <span className="line-clamp-1 text-muted-foreground">
                      {post.description}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">
                        {blogCategories[
                          post.category as keyof typeof blogCategories
                        ]?.title ?? post.category}
                      </Badge>
                      {parseTags(post.tags.join(",")).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </span>
                  </div>
                </td>

                <td className="hidden px-4 py-3 align-middle sm:table-cell">
                  <PostStatusBadge post={post} />
                </td>

                {showAuthor && (
                  <td className="hidden px-4 py-3 align-middle lg:table-cell">
                    <span className="flex items-center gap-2">
                      <UserAvatar
                        user={getUser(post.authorId)}
                        className="size-5"
                        fallbackClassName="text-[9px]"
                      />
                      <span className="truncate text-muted-foreground">
                        {getUserName(post.authorId)}
                      </span>
                    </span>
                  </td>
                )}

                <td className="hidden px-4 py-3 align-middle text-muted-foreground md:table-cell">
                  {post.deletedAt
                    ? `Deleted ${formatDate(post.deletedAt)}`
                    : formatDate(post.updatedAt)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {trashable ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restorePost(post)}
                      >
                        <RotateCcw />
                        Restore
                      </Button>
                    ) : (
                      <>
                        {post.status === "published" && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Preview ${post.title}`}
                            render={<Link href={`/blog/${post.slug}`} />}
                          >
                            <Eye />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          render={<Link href={`/dashboard/posts/${post.id}`} />}
                        >
                          <Pencil />
                          Edit
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Delete ${post.title}`}
                          onClick={() => setPendingDelete(post)}
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setConfirmPhrase("")
          }
        }}
      >
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Move to trash</DialogTitle>
            <DialogDescription>
              &quot;{pendingDelete?.title}&quot; will be removed from the blog
              and can be restored later. Nothing is deleted permanently.
            </DialogDescription>
          </DialogHeader>

          <form
            id="delete-post"
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (pendingDelete && confirmPhraseMatches)
                deletePost(pendingDelete)
            }}
          >
            <Label htmlFor="delete-phrase">
              Type <span className="font-semibold">move to trash</span> to
              confirm
            </Label>
            <Input
              id="delete-phrase"
              autoComplete="off"
              value={confirmPhrase}
              onChange={(event) => setConfirmPhrase(event.target.value)}
            />
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              form="delete-post"
              disabled={!confirmPhraseMatches}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Move to trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PostStatusBadge({ post }: { post: Post }) {
  if (post.deletedAt) {
    return (
      <Badge
        variant="outline"
        className="border-destructive/40 text-destructive"
      >
        Trashed
      </Badge>
    )
  }
  return post.status === "published" ? (
    <Badge variant="secondary">Published</Badge>
  ) : (
    <Badge variant="outline">Draft</Badge>
  )
}

// The phrase a user types to confirm a destructive action. A constant, not a
// value read from the post, so the prompt can't be satisfied by post content.
function postTitlePhrase() {
  return DELETE_CONFIRM_PHRASE
}

const DELETE_CONFIRM_PHRASE = "move to trash"
