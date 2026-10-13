import { siteConfig } from "@/config/site"
// The site-wide card (app/opengraph-image.tsx). Named here because a page
// setting openGraph replaces the layout's, images included.
const defaultImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: siteConfig.name,
}
// Single source of per-page metadata: title, canonical URL and social cards.
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  noIndex,
} = {}) {
  // Social cards have no title template, so they spell the full title out.
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  // Social platforms ignore SVG, so an SVG cover falls back to the site card.
  const custom = image && !image.endsWith(".svg") ? image : undefined
  const images = custom ? [custom] : [defaultImage]
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url: path,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
