"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { SectionCard } from "@/components/dashboard/section-card"
import { ImagePicker } from "@/components/shared/image-picker"
import { TaxonomyInput } from "@/components/shared/taxonomy-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { POST_LIMITS, POST_STATUSES } from "@/config/constants"
import { getTaxonomy } from "@/lib/api/taxonomy"
import { parseTags, validatePostForm } from "@/lib/validate-post"

const INITIAL_VALUES = {
  title: "",
  description: "",
  content: "",
  tags: [],
  category: "",
  featuredImage: "",
}

// Where the back control goes, shown above the form on both create and edit.
const BACK_HREF = "/dashboard/posts"

const KEY_ENTER = "Enter"

/**
 * Create and edit share one form.
 *
 * Order follows how a post is actually written: the cover sets the scene, then
 * the words, then where it files. Category and tags autocomplete against what
 * already exists but still accept something new.
 *
 * `isEdit` relaxes the image rule, because the edit endpoint keeps the existing
 * cover unless a new file is sent.
 */
export function PostForm({
  initialValues = INITIAL_VALUES,
  // The label on the primary action. "Publish" on create, "Publish" on a
  // draft, and "Save changes" on a post that is already out there.
  publishLabel = "Publish",
  onSubmit,
  onCancel,
  isEdit = false,
  busy = false,
}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [taxonomy, setTaxonomy] = useState({ categories: [], tags: [] })

  // The form must still accept typing something new if these never arrive, so
  // the list starts empty and failures are silent rather than blocking.
  useEffect(() => {
    let cancelled = false

    getTaxonomy().then((loaded) => {
      if (!cancelled) setTaxonomy(loaded)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // The old form kept tags as the raw comma-separated string. Anything else
  // passing an older shape in should not crash the editor.
  const tags = Array.isArray(values.tags)
    ? values.tags
    : parseTags(values.tags)

  function update(key, value) {
    setValues((previous) => ({ ...previous, [key]: value }))
    // Clear the field's error as soon as it is edited, so the message never
    // contradicts what is on screen.
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  function submit(status) {
    if (busy) return
    const found = validatePostForm({ ...values, tags, isEdit })
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error("Fix the highlighted fields.")
      return
    }
    onSubmit({ ...values, tags }, imageFile, status)
  }

  /**
   * Enter must never submit.
   *
   * A long form with a title, an excerpt and an article body is easy to lose
   * half a draft in by pressing Enter in a field that was not the one you were
   * thinking about. The buttons below are the only way to save.
   */
  function handleFormKeyDown(event) {
    if (event.key !== KEY_ENTER) return
    // A button handles its own Enter — that is the button being activated.
    if (event.target instanceof HTMLElement && event.target.tagName === "BUTTON") {
      return
    }
    event.preventDefault()
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit px-2 text-muted-foreground"
        nativeButton={false}
        render={<Link href={BACK_HREF} />}
      >
        <ArrowLeft aria-hidden />
        Back to posts
      </Button>

      <form
        onSubmit={(event) => event.preventDefault()}
        onKeyDown={handleFormKeyDown}
        className="flex flex-col gap-6"
        noValidate
      >
        <SectionCard
          title="Featured image"
          description="The cover shown on the homepage, in the archive and on social cards."
          footer={
            <p>
              {isEdit
                ? "Leave the cover alone to keep the current one, or upload a replacement."
                : "Required. It uploads when you create the post."}
            </p>
          }
        >
          <ImagePicker
            id="post-image"
            label="Cover"
            value={values.featuredImage}
            onChange={(value) => update("featuredImage", value)}
            onFileChange={setImageFile}
            // No library: the API takes a file, and a library of stock photos
            // would be anyone else's face on your post.
            library={[]}
            error={errors.featuredImage}
          />
        </SectionCard>

        <SectionCard
          title="Content"
          description="What the post is about. The title and excerpt are what readers see in listings and search results."
          footer={
            // Counters appear only once they have something to say.
            <>
              <OverLimitNotice
                value={values.title}
                max={POST_LIMITS.TITLE_MAX}
                noun="title"
              />
              <OverLimitNotice
                value={values.description}
                max={POST_LIMITS.DESCRIPTION_MAX}
                noun="excerpt"
              />
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <Field
              id="post-title"
              label="Title"
              error={errors.title}
              hint={`Shown as the headline everywhere. ${POST_LIMITS.TITLE_MIN}–${POST_LIMITS.TITLE_MAX} characters.`}
            >
              <Input
                id="post-title"
                value={values.title}
                placeholder="Ship the UI first, the backend later"
                aria-invalid={Boolean(errors.title)}
                onChange={(event) => update("title", event.target.value)}
              />
            </Field>

            <Field
              id="post-description"
              label="Excerpt"
              error={errors.description}
              hint={`One or two sentences, used in listings and social cards. ${POST_LIMITS.DESCRIPTION_MIN}–${POST_LIMITS.DESCRIPTION_MAX} characters.`}
            >
              <textarea
                id="post-description"
                value={values.description}
                rows={3}
                placeholder="Every screen renders from one file of constants. Swap it for your API and nothing else has to change."
                aria-invalid={Boolean(errors.description)}
                onChange={(event) => update("description", event.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30"
              />
            </Field>

            <Field
              id="post-content"
              label="Article body"
              error={errors.content}
              hint="The post itself, as HTML. Stored as-is and rendered on the post page."
            >
              <textarea
                id="post-content"
                value={values.content}
                rows={14}
                placeholder="<p>Start writing…</p>"
                spellCheck
                onChange={(event) => update("content", event.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Categories and tags"
          description="Where the post sits. A category is the single section it belongs to; tags are the free-form labels readers filter on."
        >
          <div className="flex flex-col gap-5">
            <TaxonomyInput
              id="post-category"
              label="Category"
              options={taxonomy.categories}
              value={values.category}
              onChange={(value) => update("category", value)}
              error={errors.category}
              minLength={POST_LIMITS.CATEGORY_MIN}
              maxLength={POST_LIMITS.CATEGORY_MAX}
              hint={`Pick one that exists or invent one. ${POST_LIMITS.CATEGORY_MIN}–${POST_LIMITS.CATEGORY_MAX} characters.`}
            />

            <TaxonomyInput
              id="post-tags"
              label="Tags"
              multiple
              options={taxonomy.tags}
              value={tags}
              onChange={(value) => update("tags", value)}
              error={errors.tags}
              maxItems={POST_LIMITS.TAGS_MAX}
              maxLength={POST_LIMITS.CATEGORY_MAX}
              hint={`Pick existing ones or invent new. ${POST_LIMITS.TAGS_MIN}–${POST_LIMITS.TAGS_MAX}. Currently: ${tags.length}.`}
            />
          </div>
        </SectionCard>

        {/* Actions sit last, below category and tags, so the reader has finished
            the whole form before the thing they are about to press. */}
        <div className="flex flex-wrap justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-2.5"
            disabled={busy}
            onClick={() => submit(POST_STATUSES.DRAFT)}
          >
            Save as draft
          </Button>
          <Button
            type="button"
            size="sm"
            className="px-2.5"
            disabled={busy}
            onClick={() => submit(POST_STATUSES.PUBLISHED)}
          >
            {publishLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}

/**
 * The character counter, but only once it is bad news.
 *
 * A permanent "12/500" is noise on an empty field; the same number turning red
 * the moment it matters is information.
 *
 * The fields deliberately carry no maxLength: with one, the browser silently
 * truncates and the limit can never be crossed, which makes this unreachable.
 */
function OverLimitNotice({ value, max, noun }) {
  if (value.length <= max) return null

  return (
    <p role="alert" className="text-destructive">
      {noun} is {value.length - max} character
      {value.length - max === 1 ? "" : "s"} over the {max} limit
    </p>
  )
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}