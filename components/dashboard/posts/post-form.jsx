"use client"

import { useState } from "react"
import { toast } from "sonner"

import { SectionCard } from "@/components/dashboard/section-card"
import { ImagePicker } from "@/components/shared/image-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { POST_LIMITS } from "@/config/constants"
import { parseTags, validatePostForm } from "@/lib/validate-post"

const INITIAL_VALUES = {
  title: "",
  description: "",
  content: "",
  tags: "",
  category: "",
  featuredImage: "",
}

/**
 * Create and edit share one form.
 *
 * `isEdit` relaxes the image rule, because the edit endpoint keeps the existing
 * cover unless a new file is sent.
 */
export function PostForm({
  initialValues = INITIAL_VALUES,
  submitLabel = "Create post",
  onSubmit,
  onCancel,
  isEdit = false,
  busy = false,
}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const parsedTags = parseTags(values.tags)

  function update(key, value) {
    setValues((previous) => ({ ...previous, [key]: value }))
    // Clear the field's error as soon as it is edited, so the message never
    // contradicts what is on screen.
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  function submit(event) {
    event.preventDefault()
    if (busy) return
    const found = validatePostForm({ ...values, isEdit })
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error("Fix the highlighted fields.")
      return
    }
    onSubmit({ ...values, tags: parsedTags }, imageFile)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <SectionCard
        title="Content"
        description="What the post is about. The title and description are what readers see in listings and search results."
        footer={
          <>
            <p>
              {values.title.length}/{POST_LIMITS.TITLE_MAX} title,{" "}
              {values.description.length}/{POST_LIMITS.DESCRIPTION_MAX} description
            </p>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="px-2.5"
                disabled={busy}
              >
                {submitLabel}
              </Button>
            </div>
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
              maxLength={POST_LIMITS.TITLE_MAX}
              placeholder="Ship the UI first, the backend later"
              aria-invalid={Boolean(errors.title)}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>

          <Field
            id="post-description"
            label="Description"
            error={errors.description}
            hint={`One or two sentences, used in listings and social cards. ${POST_LIMITS.DESCRIPTION_MIN}–${POST_LIMITS.DESCRIPTION_MAX} characters.`}
          >
            <textarea
              id="post-description"
              value={values.description}
              maxLength={POST_LIMITS.DESCRIPTION_MAX}
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
          <Field
            id="post-category"
            label="Category"
            error={errors.category}
            hint={`Free text, ${POST_LIMITS.CATEGORY_MIN}–${POST_LIMITS.CATEGORY_MAX} characters. Matching an existing name reuses it.`}
          >
            <Input
              id="post-category"
              value={values.category}
              maxLength={POST_LIMITS.CATEGORY_MAX}
              placeholder="Engineering"
              aria-invalid={Boolean(errors.category)}
              onChange={(event) => update("category", event.target.value)}
            />
          </Field>

          <Field
            id="post-tags"
            label="Tags"
            error={errors.tags}
            hint={`Comma separated, ${POST_LIMITS.TAGS_MIN}–${POST_LIMITS.TAGS_MAX}. Currently: ${parsedTags.length}.`}
          >
            <Input
              id="post-tags"
              value={values.tags}
              placeholder="performance, images, nextjs"
              aria-invalid={Boolean(errors.tags)}
              onChange={(event) => update("tags", event.target.value)}
            />
          </Field>

          {parsedTags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {parsedTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Featured image"
        description="The cover shown on the homepage, in the archive and on social cards."
        footer={
          <p>
            {isEdit
              ? "Leave the cover alone to keep the current one."
              : "Pick a cover from the library, or upload your own."}
          </p>
        }
      >
        <ImagePicker
          id="post-image"
          label="Cover"
          value={values.featuredImage}
          onChange={(value) => update("featuredImage", value)}
          onFileChange={setImageFile}
          // No library: the backend takes a multipart upload, not a path into
          // /public, so there is nothing a library pick could offer here.
          library={[]}
          error={errors.featuredImage}
        />
      </SectionCard>
    </form>
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