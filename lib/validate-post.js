import { POST_LIMITS } from "@/config/constants"

/**
 * Splits the comma-separated tag field. The backend upserts whatever it gets,
 * so trimming and dropping blanks here keeps stray commas from becoming empty
 * tags.
 */
export function parseTags(value) {
  return [
    ...new Set(
      String(value ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    ),
  ]
}

/**
 * The same rules the backend enforces in src/validation/blog.validation.js.
 *
 * `tags` arrives as a list from the autocomplete, but is coerced here too so a
 * caller still passing the old comma-separated string validates identically.
 *
 * Kept so the form can fail fast, not to replace server validation — the
 * backend is still the authority and 400s are handled at the call site.
 */
export function validatePostForm(values) {
  const errors = {}
  const title = values.title.trim()
  const description = values.description.trim()
  const category = values.category.trim()
  const tags = parseTags(values.tags)

  if (title.length < POST_LIMITS.TITLE_MIN) {
    errors.title = `Title needs at least ${POST_LIMITS.TITLE_MIN} characters.`
  } else if (title.length > POST_LIMITS.TITLE_MAX) {
    errors.title = `Title must be ${POST_LIMITS.TITLE_MAX} characters or fewer.`
  }

  if (description.length < POST_LIMITS.DESCRIPTION_MIN) {
    errors.description = `Description needs at least ${POST_LIMITS.DESCRIPTION_MIN} characters.`
  } else if (description.length > POST_LIMITS.DESCRIPTION_MAX) {
    errors.description = `Description must be ${POST_LIMITS.DESCRIPTION_MAX} characters or fewer.`
  }

  if (category.length < POST_LIMITS.CATEGORY_MIN) {
    errors.category = `Category needs at least ${POST_LIMITS.CATEGORY_MIN} characters.`
  } else if (category.length > POST_LIMITS.CATEGORY_MAX) {
    errors.category = `Category must be ${POST_LIMITS.CATEGORY_MAX} characters or fewer.`
  }

  if (tags.length < POST_LIMITS.TAGS_MIN) {
    errors.tags = "Add at least one tag."
  } else if (tags.length > POST_LIMITS.TAGS_MAX) {
    errors.tags = `Use at most ${POST_LIMITS.TAGS_MAX} tags — you have ${tags.length}.`
  }

  // Only required on create: the edit endpoint keeps the existing cover when no
  // new file is sent.
  if (!values.featuredImage && !values.isEdit) {
    errors.featuredImage = "A featured image is required."
  }

  return errors
}