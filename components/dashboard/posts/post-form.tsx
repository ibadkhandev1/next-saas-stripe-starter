"use client"

import { useState } from "react"
import { toast } from "sonner"

import { SectionCard } from "@/components/dashboard/section-card"
import { ImagePicker } from "@/components/shared/image-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  parseTags,
  postCategories,
  validatePostForm,
  type PostFormErrors,
  type PostFormValues,
} from "@/modules/demo/posts"
import { blogCategories } from "@/config/blog"
import { blogCovers } from "@/config/media"

const INITIAL_VALUES: PostFormValues = {
  title: "",
  description: "",
  tags: "",
  category: "",
  featuredImage: "",
}

// Create and edit share one form. Demo mode: saving is local state plus a toast,
// so `onSubmit` is where a real mutation goes.
export function PostForm({
  initialValues = INITIAL_VALUES,
  submitLabel = "Create post",
  onSubmit,
  onCancel,
}: {
  initialValues?: PostFormValues
  submitLabel?: string
  onSubmit: (values: PostFormValues) => void
  onCancel?: () => void
}) {
  const [values, setValues] = useState<PostFormValues>(initialValues)
  const [errors, setErrors] = useState<PostFormErrors>({})

  const parsedTags = parseTags(values.tags)

  function update<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K]
  ) {
    setValues((previous) => ({ ...previous, [key]: value }))
    // Clear the field's error as soon as it is edited, so the message never
    // contradicts what is on screen.
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const found = validatePostForm(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error("Fix the highlighted fields.")
      return
    }
    onSubmit({ ...values, tags: parsedTags.join(", ") })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <SectionCard
        title="Content"
        description="What the post is about. The title and description are what readers see in listings and search results."
        footer={
          <>
            <p>
              {values.title.length}/{MAX_TITLE_LENGTH} title,{" "}
              {values.description.length}/{MAX_DESCRIPTION_LENGTH} description
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
              <Button type="submit" size="sm" className="px-2.5">
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
            hint={`Shown as the headline everywhere. Up to ${MAX_TITLE_LENGTH} characters.`}
          >
            <Input
              id="post-title"
              value={values.title}
              maxLength={MAX_TITLE_LENGTH}
              placeholder="Ship the UI first, the backend later"
              aria-invalid={Boolean(errors.title)}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>

          <Field
            id="post-description"
            label="Description"
            error={errors.description}
            hint="One or two sentences, used in listings and social cards."
          >
            <textarea
              id="post-description"
              value={values.description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              placeholder="Every screen renders from one file of constants. Swap it for your API and nothing else has to change."
              aria-invalid={Boolean(errors.description)}
              onChange={(event) => update("description", event.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30"
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
            hint="One category per post. It decides which section the post appears under."
          >
            <select
              id="post-category"
              value={values.category}
              aria-invalid={Boolean(errors.category)}
              onChange={(event) => update("category", event.target.value)}
              className={cn(
                "h-9 w-full max-w-[300px] rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
                !values.category && "text-muted-foreground"
              )}
            >
              <option value="">Choose a category</option>
              {postCategories.map((key) => (
                <option key={key} value={key}>
                  {blogCategories[key as keyof typeof blogCategories]?.title ??
                    key}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="post-tags"
            label="Tags"
            error={errors.tags}
            hint={`Comma separated, up to ${MAX_TAGS}. Currently: ${parsedTags.length}.`}
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
        footer={<p>Pick a cover from the library, or upload your own.</p>}
      >
        <ImagePicker
          id="post-image"
          label="Cover"
          value={values.featuredImage}
          onChange={(value) => update("featuredImage", value)}
          library={blogCovers}
          error={errors.featuredImage}
        />
      </SectionCard>
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
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
