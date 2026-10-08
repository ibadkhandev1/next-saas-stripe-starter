import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { blogSource } from "@/lib/content/blog" // module:blog
import { legalSource } from "@/lib/content/legal"

const absolute = (path: string) => new URL(path, siteConfig.url).toString()

// Public pages only: dashboard and admin routes are noindex and stay out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
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
  for (const post of blogSource.getPages()) {
    entries.push({
      url: absolute(post.url),
      lastModified: post.data.date,
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