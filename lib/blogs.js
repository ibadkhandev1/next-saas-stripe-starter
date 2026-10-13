import "server-only"

import { API_URL } from "@/config/constants"

// Every post lives in the Express backend. This module is the only place that
// talks to it, so a field rename on that side is fixed here and nowhere else.
//
// Note: `getSession()` in lib/auth/session is for the current user. This
// module deliberately reads the API directly rather than going through the
// /api proxy, because it already runs on the server and the cookie would be
// dead weight — these endpoints are either public or read from the access
// token below.

export const POST_PAGE_SIZE = 9

/**
 * The API sends timestamps as ISO strings. Everything downstream expects real
 * Dates — `formatDate` calls `toLocaleDateString` with formatting options
 * (which a string silently ignores) and the pages call `toISOString()` (which
 * throws on a string). Normalising once here keeps that out of every caller.
 */
function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toPost(api) {
  // `category` and `tags` arrive populated (the backend populates them), but
  // fall back to the raw id so a missing populate shows a placeholder rather
  // than crashing a page.
  const category = api.category ?? {}
  const tags = Array.isArray(api.tags) ? api.tags : []

  return {
    id: api._id,
    slug: api.slug,
    title: api.title,
    description: api.description,
    // The article body, as HTML.
    content: api.content ?? "",
    category: category.name ?? "",
    categorySlug: category.slug ?? "",
    categoryId: category._id ?? (typeof api.category === "string" ? api.category : ""),
    tags: tags.map((tag) => tag.name ?? tag),
    tagIds: tags.map((tag) => tag._id ?? tag),
    featuredImage: api.featured_image,
    status: api.status,
    publishedAt: toDate(api.published_at),
    deletedAt: toDate(api.deleted_at),
    createdAt: toDate(api.createdAt) ?? new Date(0),
    updatedAt: toDate(api.updatedAt),
    authorId: api.user_id,
  }
}

async function call(path, { token, init = {} } = {}) {
  if (!API_URL) return null
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: {
        ...(init.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      // Posts change whenever someone publishes one.
      cache: "no-store",
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) return { error: body?.message ?? "Request failed" }
    return body
  } catch {
    // A backend that is down should not take the blog down with it; the pages
    // fall back to an empty state.
    return null
  }
}

// --- Public ----------------------------------------------------------------

/** Published posts, newest first. */
export async function getPublishedBlogs({ page = 1 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(POST_PAGE_SIZE),
  })
  const body = await call(`/blog?${query}`)
  const posts = (body?.data ?? []).map(toPost)

  return {
    posts,
    page: body?.pagination?.currentPage ?? page,
    pageCount: body?.pagination?.totalPages ?? 0,
    total: body?.pagination?.totalItems ?? 0,
  }
}

export async function getBlogBySlug(slug) {
  const body = await call(`/blog/${encodeURIComponent(slug)}`)
  if (!body?.data) return null
  return toPost(body.data)
}

/**
 * Every published post, for the sitemap and the homepage.
 *
 * Walks the pages rather than trusting one response: the backend caps a page,
 * and the homepage wants the newest handful, not the whole archive.
 */
export async function getAllPublishedBlogs(max = 60) {
  const posts = []
  let page = 1
  let pageCount = 1

  do {
    const result = await getPublishedBlogs({ page })
    posts.push(...result.posts)
    pageCount = result.pageCount
    page++
  } while (page <= pageCount && posts.length < max)

  return posts.slice(0, max)
}

// --- Authenticated ---------------------------------------------------------

/** The signed-in author's own posts, trashed ones excluded. */
export async function getMyBlogs({ token, page = 1 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(POST_PAGE_SIZE),
  })
  const body = await call(`/blog/my?${query}`, { token })
  return {
    posts: (body?.data ?? []).map(toPost),
    page: body?.pagination?.currentPage ?? page,
    pageCount: body?.pagination?.totalPages ?? 0,
    total: body?.pagination?.totalItems ?? 0,
  }
}

/** Trashed posts. The backend has no pagination on this one. */
export async function getTrashedBlogs({ token } = {}) {
  const body = await call("/blog/trash", { token })
  return {
    posts: (body?.data ?? []).map(toPost),
    total: body?.data?.length ?? 0,
  }
}

/**
 * One post by id, for the editor.
 *
 * There is no `GET /blog/:id` on the backend — only `/:slug`, which needs the
 * slug and hides drafts. So this pages through the author's own posts, which the
 * backend already scopes to them and to `deleted_at: null`.
 */
export async function getBlogById(id, token) {
  let page = 1
  let pageCount = 1

  do {
    const { posts, pageCount: count } = await getMyBlogs({ token, page })
    const match = posts.find((post) => post.id === id)
    if (match) return match
    pageCount = count
    page++
  } while (page <= pageCount)

  return null
}

/**
 * Authors seen across the public posts.
 *
 * There is no users endpoint on the backend yet, so this can only offer the
 * author id and how much they have written. Names will need one.
 */
export async function getAuthors() {
  const posts = await getAllPublishedBlogs(60)
  const byAuthor = new Map()

  for (const post of posts) {
    const entry = byAuthor.get(post.authorId) ?? {
      id: post.authorId,
      postCount: 0,
      lastPostAt: null,
    }
    entry.postCount += 1
    if (!entry.lastPostAt || post.createdAt > entry.lastPostAt) {
      entry.lastPostAt = post.createdAt
    }
    byAuthor.set(post.authorId, entry)
  }

  return [...byAuthor.values()].sort((a, b) => b.postCount - a.postCount)
}