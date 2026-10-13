"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/config/constants"
import { cn } from "@/lib/utils"
// A pick from the library is a real path. An uploaded file becomes an object
// URL, which previews locally but has to be uploaded before it can be saved.
const BLOB_PREFIX = "blob:"

export function isLocalPreview(value) {
  return value.startsWith(BLOB_PREFIX)
}

const ACCEPTED_TYPES = "image/*"

export function ImagePicker({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  // The actual File, for callers that post multipart. A library pick has no
  // file and passes null. Omit this if the picker is only choosing a path.
  onFileChange,
  library,
  // `video` is the 1200x630 cover ratio, `square` for avatars.
  aspect = "video",
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const fileInputRef = useRef(null)
  // Object URLs are revoked when they are replaced or the picker unmounts, or
  // the file stays in memory for the life of the tab.
  const [objectUrl, setObjectUrl] = useState(null)
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])
  function uploadFile(file) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG or WEBP image.")
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`Images must be ${MAX_UPLOAD_BYTES / 1024 / 1024} MB or smaller.`)
      return
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    onChange(url)
    onFileChange?.(file)
    toast.success("Image selected.")
  }
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="flex flex-wrap items-center gap-2">
        {/* No library means no dialog to open — the Upload button is then the
            only way in, which is what a multipart API requires. */}
        {library.length > 0 && (
          <Button
            type="button"
            id={id}
            size="sm"
            variant="outline"
            className="px-2.5"
            onClick={() => {
              setDraft(value)
              setOpen(true)
            }}
          >
            Choose from library
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="px-2.5"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) uploadFile(file)
            // Reset so picking the same file twice still fires a change event.
            event.target.value = ""
          }}
        />

        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="px-2.5 text-muted-foreground"
            onClick={() => {
              onChange("")
              onFileChange?.(null)
            }}
          >
            Remove
          </Button>
        )}

        {value && (
          <span className="text-xs text-muted-foreground">
            {fileName(value)}
          </span>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}

      {isLocalPreview(value) && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          This file is selected but not uploaded yet. Save the form to store it.
        </p>
      )}

      {library.length > 0 && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl rounded-lg">
            <DialogHeader>
              <DialogTitle>Choose {label.toLowerCase()}</DialogTitle>
              <DialogDescription>
                Pick an image already in the project, or upload your own.
              </DialogDescription>
            </DialogHeader>

          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {library.map((item) => (
              <li key={item.src}>
                <button
                  type="button"
                  onClick={() => setDraft(item.src)}
                  aria-pressed={draft === item.src}
                  className={cn(
                    "block w-full overflow-hidden rounded-lg border text-left transition-colors",
                    draft === item.src
                      ? "border-foreground ring-1 ring-foreground/40"
                      : "hover:border-foreground/40"
                  )}
                >
                  <span
                    className={cn(
                      "block bg-muted/40",
                      aspect === "square"
                        ? "aspect-square"
                        : "aspect-[1200/630]"
                    )}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes="160px"
                      className={cn(
                        "object-cover",
                        aspect === "square" && "object-cover"
                      )}
                    />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-xs">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!draft}
              onClick={() => {
                onChange(draft)
                // A library pick is a path, not a file.
                onFileChange?.(null)
                setOpen(false)
              }}
            >
              Use this image
            </Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
// The file name, so the current selection is identifiable without a preview.
function fileName(value) {
  const lastSegment = value.split("/").at(-1) ?? value
  return isLocalPreview(value)
    ? "Uploaded file"
    : decodeURIComponent(lastSegment)
}
