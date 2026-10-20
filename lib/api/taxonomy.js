import { api } from "@/lib/api/client"

/**
 * The vocabulary the post form autocompletes from.
 *
 * Both endpoints are public on the backend: a category or tag name is already
 * visible on any published post that carries it.
 *
 * Cached per mount by the form rather than per keystroke — the list is small and
 * does not change while someone is typing.
 */
export async function getCategories() {
  const { data } = await api.get("/blog/categories")
  return (data.data ?? []).map((category) => category.name).filter(Boolean)
}

export async function getTags() {
  const { data } = await api.get("/blog/tags")
  return (data.data ?? []).map((tag) => tag.name).filter(Boolean)
}

/**
 * Both lists at once, since the form always needs both and they are independent.
 *
 * A failure in either resolves to an empty list rather than rejecting: the form
 * must still let an author type something new when the suggestions cannot load.
 */
export async function getTaxonomy() {
  const [categories, tags] = await Promise.all([
    getCategories().catch(() => []),
    getTags().catch(() => []),
  ])
  return { categories, tags }
}