// Demo blog posts for the dashboard. Nothing here is persisted: the mutations
// in `components/dashboard/posts/*` update local state only and say so.
//
// This is the seam to replace with your backend. `Post`, `PostStatus` and the
// three list helpers mirror the shape the UI consumes, so swapping the
// implementation never changes a component.

import { blogCategories } from "@/config/blog"

export type PostStatus = "draft" | "published"

export type Post = {
  id: string
  // The URL segment. Separate from `id` so a backend can use its own key.
  slug: string
  title: string
  description: string
  // Free-form labels, separate from the single category.
  tags: string[]
  category: string
  // Path to the cover image, as served from /public.
  featuredImage: string
  status: PostStatus
  // Key of the author in `modules/demo/users.ts`. The admin views group by it.
  authorId: string
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  // Soft delete: a trashed post keeps its content so it can be restored.
  deletedAt: Date | null
}

// The category a post form offers. Kept as a list so the dropdown and the
// validation below can't drift apart.
export const postCategories = Object.keys(blogCategories)

export const MAX_TITLE_LENGTH = 120
export const MAX_DESCRIPTION_LENGTH = 300
export const MAX_TAGS = 8

const DEMO_POSTS: Post[] = [
  {
    id: "post-ship-ui-first",
    slug: "ship-the-ui-first",
    title: "Ship the UI first, the backend later",
    description:
      "Every screen in this project renders from one file of constants. Swap it for your API and nothing else has to change.",
    tags: ["architecture", "demo-data", "frontend"],
    category: "education",
    featuredImage: "/_static/blog/cover-flags.webp",
    authorId: "demo-user",
    status: "published",
    createdAt: new Date("2026-09-28"),
    updatedAt: new Date("2026-10-02"),
    publishedAt: new Date("2026-10-02"),
    deletedAt: null,
  },
  {
    id: "post-fast-blog-engine",
    slug: "writing-a-fast-blog-engine",
    title: "Writing a blog engine that stays fast",
    description:
      "Covers are decoded once at build time, lists are paginated in memory, and nothing on the reading path touches a server.",
    tags: ["performance", "images", "nextjs"],
    category: "education",
    featuredImage: "/_static/blog/cover-modules.webp",
    authorId: "demo-user-2",
    status: "published",
    createdAt: new Date("2026-09-20"),
    updatedAt: new Date("2026-09-24"),
    publishedAt: new Date("2026-09-24"),
    deletedAt: null,
  },
  {
    id: "post-blog-goes-live",
    slug: "the-blog-goes-live",
    title: "The blog goes live",
    description:
      "A reading experience, an admin panel, and no backend behind either of them.",
    tags: ["launch", "news"],
    category: "news",
    featuredImage: "/_static/blog/cover-waves.webp",
    authorId: "demo-user-3",
    status: "published",
    createdAt: new Date("2026-09-12"),
    updatedAt: new Date("2026-09-14"),
    publishedAt: new Date("2026-09-14"),
    deletedAt: null,
  },
  {
    id: "post-drafts-and-tags",
    slug: "drafts-and-tags",
    title: "Drafting: tags, categories and when to use each",
    description:
      "Working notes on the difference between a category and a tag, and why the post form asks for both.",
    tags: ["taxonomy", "writing"],
    category: "education",
    featuredImage: "/_static/blog/cover-database.webp",
    authorId: "demo-user-2",
    status: "draft",
    createdAt: new Date("2026-10-05"),
    updatedAt: new Date("2026-10-06"),
    publishedAt: null,
    deletedAt: null,
  },
  {
    id: "post-trashed-example",
    slug: "a-post-in-the-trash",
    title: "A post in the trash",
    description:
      "Deleting a post keeps its content so it can be restored. This one is in the trash to show that.",
    tags: ["demo-data"],
    category: "news",
    featuredImage: "/_static/blog/cover-billing.webp",
    authorId: "demo-user-3",
    status: "draft",
    createdAt: new Date("2026-08-30"),
    updatedAt: new Date("2026-09-02"),
    publishedAt: null,
    deletedAt: new Date("2026-10-01"),
  },
]

/** Every post, newest first, including trashed ones. */
export function getAllPosts(): Post[] {
  return [...DEMO_POSTS].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )
}

/** Live posts: not in the trash. */
export function getPosts(): Post[] {
  return getAllPosts().filter((post) => post.deletedAt === null)
}

/** Trashed posts, most recently deleted first. */
export function getTrashedPosts(): Post[] {
  return getAllPosts()
    .filter((post) => post.deletedAt !== null)
    .sort(
      (a, b) => (b.deletedAt?.getTime() ?? 0) - (a.deletedAt?.getTime() ?? 0)
    )
}

export function getPost(id: string): Post | undefined {
  return DEMO_POSTS.find((post) => post.id === id)
}

/** Live posts by one author, newest first. */
export function getPostsByAuthor(authorId: string): Post[] {
  return getPosts().filter((post) => post.authorId === authorId)
}

// --- Validation -------------------------------------------------------------

export type PostFormValues = {
  title: string
  description: string
  tags: string
  category: string
  featuredImage: string
}

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>

export function validatePostForm(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {}

  if (!values.title.trim()) errors.title = "Give the post a title."
  else if (values.title.length > MAX_TITLE_LENGTH)
    errors.title = `Keep the title under ${MAX_TITLE_LENGTH} characters.`

  if (!values.description.trim())
    errors.description = "Add a short description."
  else if (values.description.length > MAX_DESCRIPTION_LENGTH)
    errors.description = `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`

  if (!values.category) errors.category = "Pick a category."
  else if (!postCategories.includes(values.category))
    errors.category = "That category doesn't exist."

  const tags = parseTags(values.tags)
  if (tags.length > MAX_TAGS) errors.tags = `Use at most ${MAX_TAGS} tags.`

  if (!values.featuredImage.trim())
    errors.featuredImage = "Choose a featured image."
  else if (
    !values.featuredImage.startsWith("/") &&
    !values.featuredImage.startsWith("blob:")
  )
    errors.featuredImage = "Pick an image from the library or upload a file."

  return errors
}

/** Splits the comma-separated tag field into trimmed, unique, lowercase tags. */
export function parseTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    ),
  ]
}
