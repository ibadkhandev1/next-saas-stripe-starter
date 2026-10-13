import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { GridSection } from "@/components/marketing/grid-section"
import { BlurImage } from "@/components/shared/blur-image"
import { buttonVariants } from "@/components/ui/button"
import { getPublishedBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn, formatDate } from "@/lib/utils"

// Three posts: a full row of the grid.
const FEATURED_POSTS = 3

export const metadata = buildMetadata({
  title: "Writing about what we build",
  description: "Essays and guides on running a blog and its admin dashboard.",
  path: "/",
})

export default async function HomePage() {
  const { posts, total } = await getPublishedBlogs({ page: 1 })
  const featured = posts.slice(0, FEATURED_POSTS)

  return (
    <>
      <GridSection lines innerClassName="py-20 sm:py-28">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-medium tracking-[-0.03em] text-balance sm:text-5xl md:text-6xl md:leading-[1.08]">
            Notes from behind the blog
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Essays on shipping software, the decisions behind it, and what
            changed along the way.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className={cn(buttonVariants({ size: "lg" }), "px-5")}
            >
              Read the blog
              <ArrowRight />
            </Link>
          </div>
        </div>
      </GridSection>

      <GridSection innerClassName="px-0 py-14 sm:px-0 sm:py-20">
        <div className="mt-10 grid grid-cols-1 border-t border-grid-border md:grid-cols-3">
          {featured.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={cn(
                "group relative flex flex-col transition-colors hover:bg-muted/50",
                index > 0 &&
                  "border-t border-grid-border md:border-t-0 md:border-l"
              )}
            >
              <BlurImage
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={630}
                sizes="(min-width: 768px) 360px, 100vw"
                // The first card is the LCP element; the rest lazy-load.
                priority={index === 0}
                className="aspect-[1200/630] w-full bg-muted object-cover"
              />

              <div className="flex flex-1 flex-col p-6">
                {post.category && (
                  <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {post.category}
                  </span>
                )}

                <h2 className="mt-3 font-display text-lg font-bold text-balance group-hover:underline">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-pretty text-muted-foreground">
                  {post.description}
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <time
                    dateTime={post.createdAt.toISOString()}
                    className="text-sm text-muted-foreground"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </div>
            </Link>
          ))}

          {featured.length === 0 && (
            <p className="col-span-full p-10 text-sm text-muted-foreground">
              No posts published yet.
            </p>
          )}
        </div>

        {total > 0 && (
          <div className="px-4 pt-10 sm:px-12">
            <Link
              href="/blog"
              className={cn(buttonVariants({ variant: "outline" }), "px-5")}
            >
              Browse all {total} posts
              <ArrowRight />
            </Link>
          </div>
        )}
      </GridSection>
    </>
  )
}