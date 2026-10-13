import Link from "next/link"
import { notFound } from "next/navigation"

import { GridSection } from "@/components/marketing/grid-section"
import { BlurImage } from "@/components/shared/blur-image"
import { Badge } from "@/components/ui/badge"
import { getAllPublishedBlogs, getBlogBySlug } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { formatDate } from "@/lib/utils"

const RELATED_POST_LIMIT = 3

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)
  if (!post) notFound()

  // The backend has no "related" concept, so borrow posts sharing a tag. If a
  // post carries none, fall back to the most recent writing.
  const all = await getAllPublishedBlogs(60)
  const related = all
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      shared: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter(({ shared }) => post.tags.length === 0 || shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, RELATED_POST_LIMIT)
    .map(({ post: candidate }) => candidate)

  return (
    <>
      {/* Header band: badge/date, title, description, left-aligned. */}
      <GridSection lines innerClassName="pb-12 pt-16 sm:px-12">
        <div className="max-w-screen-sm">
          <div className="flex flex-wrap items-center gap-4">
            {post.category && (
              <Badge variant="secondary" className="rounded-lg">
                {post.category}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {post.publishedAt ? "Published" : "Last updated"} ·{" "}
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
          </div>
          <h1 className="mt-5 font-display text-3xl font-medium text-balance sm:text-4xl sm:leading-[1.25]">
            {post.title}
          </h1>
          <p className="mt-5 text-muted-foreground sm:text-lg">
            {post.description}
          </p>
        </div>
      </GridSection>

      {/* Gapless 3-column grid: flush image + article in the left 2/3, a
            full-height bg-muted sidebar in the right 1/3. */}
      <GridSection innerClassName="px-0 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="relative aspect-[1200/630] w-full overflow-hidden">
              <BlurImage
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={630}
                sizes="(min-width: 768px) 740px, 100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* The body is author-entered HTML stored by the backend. It is
                inserted as-is — `sanitize-html` on the write path is an open
                item, so this is the XSS surface to close first. */}
            <article
              className="prose-neutral dark:prose-invert lg:prose-lg prose max-w-none px-5 py-10 sm:px-12 prose-headings:scroll-mt-24 prose-headings:font-display prose-a:font-medium prose-a:text-foreground prose-a:underline-offset-4 prose-img:rounded-xl prose-img:border"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {related.length > 0 && (
              <div className="border-t border-grid-border p-10">
                <p className="font-display text-xl font-medium">Read more</p>
                <div className="mt-4 flex flex-col gap-4">
                  {related.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href={`/blog/${candidate.slug}`}
                      className="group flex flex-col items-center gap-4 sm:flex-row"
                    >
                      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border sm:w-[200px]">
                        <BlurImage
                          src={candidate.featuredImage}
                          alt={candidate.title}
                          width={400}
                          height={225}
                          sizes="(min-width: 640px) 200px, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-display font-medium group-hover:underline group-hover:underline-offset-4">
                          {candidate.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {candidate.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden border-l border-grid-border bg-muted/40 p-10 md:block">
            <div className="sticky top-20">
              <p className="text-sm text-muted-foreground">Tags</p>
              {post.tags.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  This post is untagged.
                </p>
              )}

              <div className="mt-8 border-t border-grid-border pt-5">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="secondary" className="mt-2">
                  {post.status}
                </Badge>
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {formatDate(post.updatedAt ?? post.createdAt)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </GridSection>
    </>
  )
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)
  if (!post) return buildMetadata({ title: "Post not found", noIndex: true })
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.featuredImage,
  })
}