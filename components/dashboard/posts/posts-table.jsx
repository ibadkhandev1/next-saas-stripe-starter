"use client"

import { Eye, FileText, Pencil, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/dashboard/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { apiErrorMessage, deletePost, restorePost } from "@/lib/api/posts"
import { formatDate } from "@/lib/utils"

// Typed to confirm a destructive action. A constant, not a value read from the
// post, so the prompt can't be satisfied by post content.
const DELETE_CONFIRM_PHRASE = "move to trash"

export function PostsTable({
  initialPosts,
  showTrashActions = false,
  showAuthor = false,
  authorNames = {},
}) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [confirmPhrase, setConfirmPhrase] = useState("")
  const [busy, setBusy] = useState(false)
  const trashable = showTrashActions

  async function handleDelete(post) {
    setBusy(true)
    try {
      await deletePost(post.id)
      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? { ...item, deletedAt: new Date(), status: "draft" }
            : item
        )
      )
      setPendingDelete(null)
      setConfirmPhrase("")
      toast.success(`"${post.title}" moved to the trash.`)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't move the post to trash."))
    } finally {
      setBusy(false)
    }
  }

  async function handleRestore(post) {
    setBusy(true)
    try {
      await restorePost(post.id)
      setPosts((previous) => previous.filter((item) => item.id !== post.id))
      toast.success(`"${post.title}" restored.`)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't restore the post."))
    } finally {
      setBusy(false)
    }
  }

  const confirmPhraseMatches = confirmPhrase === DELETE_CONFIRM_PHRASE

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
                      {post.category && (
                        <Badge variant="outline">{post.category}</Badge>
                      )}
                      {post.tags.map((tag) => (
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
                    <span className="truncate text-muted-foreground">
                      {/* Ids only until the backend grows a users endpoint. */}
                      {authorNames[post.authorId] ?? shortId(post.authorId)}
                    </span>
                  </td>
                )}

                <td className="hidden px-4 py-3 align-middle text-muted-foreground md:table-cell">
                  {post.deletedAt
                    ? `Deleted ${formatDate(post.deletedAt)}`
                    : formatDate(post.updatedAt ?? post.createdAt)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {trashable ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => handleRestore(post)}
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
                            nativeButton={false}
                            render={<Link href={`/blog/${post.slug}`} />}
                          >
                            <Eye />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          nativeButton={false}
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
              if (pendingDelete && confirmPhraseMatches && !busy) {
                handleDelete(pendingDelete)
              }
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
              disabled={!confirmPhraseMatches || busy}
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

function PostStatusBadge({ post }) {
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

/** A readable stand-in for a 24-character Mongo id. */
function shortId(id) {
  if (!id) return "Unknown"
  return `Author ${id.slice(-4).toUpperCase()}`
}