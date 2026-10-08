// Images that exist in /public. The image pickers list these instead of asking
// for a path, so a typo can't produce a broken cover.
//
// Adding one: drop the file in /public/_static, then add it here.

export type MediaItem = {
  src: string
  label: string
}

export const blogCovers: MediaItem[] = [
  { src: "/_static/blog/cover-flags.webp", label: "Flags" },
  { src: "/_static/blog/cover-modules.webp", label: "Modules" },
  { src: "/_static/blog/cover-waves.webp", label: "Waves" },
  { src: "/_static/blog/cover-database.webp", label: "Database" },
  { src: "/_static/blog/cover-billing.webp", label: "Billing" },
]

export const avatars: MediaItem[] = [
  { src: "/_static/avatars/mickasmt.webp", label: "mickasmt" },
  { src: "/_static/avatars/shadcn.jpeg", label: "shadcn" },
]
