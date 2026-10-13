// Absolute URL of the deployment, used by metadata, sitemap and robots.
// Set NEXT_PUBLIC_APP_URL in production; Vercel previews fall back to their
// own URL.
const url =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

export const siteConfig = {
  name: "Blogger",
  // Full title of the home page, also used on social cards.
  title: "Blogger — a blog and its admin panel",
  description:
    "Essays and notes on building and running a blog, written here and published from the dashboard.",
  url,
  links: {
    terms: "/terms",
    privacy: "/privacy",
  },
}