import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

// Points crawlers at the feed, the same convention every blog uses.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/admin/", "/login", "/register"],
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  }
}
