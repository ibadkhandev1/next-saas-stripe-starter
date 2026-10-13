import { siteConfig } from "@/config/site"
import { getAllPublishedBlogs } from "@/lib/blogs" // module:blog
import { legalSource } from "@/lib/content/legal"

const absolute = (path) => new URL(path, siteConfig.url).toString()

// Public pages only: dashboard and admin routes are noindex and stay out.
export default async function sitemap() {
  const now = new Date()

  const entries = [
    {
      url: absolute("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ]

  // module:blog start
  entries.push({
    url: absolute("/blog"),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  })
  for (const post of await getAllPublishedBlogs()) {
    entries.push({
      url: absolute(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? post.createdAt,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }
  // module:blog end

  for (const page of legalSource.getPages()) {
    entries.push({
      url: absolute(page.url),
      lastModified: page.data.updatedAt,
      changeFrequency: "yearly",
      priority: 0.3,
    })
  }

  return entries
}