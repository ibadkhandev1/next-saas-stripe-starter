import { CornerDownRight } from "lucide-react"
import Link from "next/link"

import {
  CategoryMenu,
  CategoryTabs,
} from "@/components/marketing/category-tabs"
import { GridSection } from "@/components/marketing/grid-section"
import { BlurImage } from "@/components/shared/blur-image"
import { Pagination } from "@/components/shared/pagination"
import { Badge } from "@/components/ui/badge"
import { getPublishedBlogs } from "@/lib/blogs"
import { buildMetadata } from "@/lib/metadata"
import { cn, formatDate } from "@/lib/utils"

export const metadata = buildMetadata({
  title: "Blog",
  description: "Guides, news and updates.",
  path: "/blog",
})

export default async function BlogPage({ searchParams }) {
  const { page: rawPage } = await searchParams
  const page = Math.max(Number(rawPage) || 1, 1)

  const { posts, pageCount, total } = await getPublishedBlogs({ page })

  const tabs = [
    { key: "all", label: "All", href: "/blog" },
    { key: "latest", label: "Latest", href: "/blog" },
  ]

  return (
    <>
      <GridSection lines innerClassName="py-12">
        <h1 className="font-display text-4xl font-medium sm:text-5xl sm:leading-[1.15]">
          Blog
        </h1>
        <p className="mt-2 text-lg text-muted-foreground sm:text-lg">
          {total} {total === 1 ? "post" : "posts"} on the site.
        </p>
        <CategoryTabs
          tabs={tabs}
          active="all"
          className="mt-7 hidden w-fit justify-start sm:flex"
        />
        <CategoryMenu
          tabs={tabs}
          active="all"
          className="mt-8 sm:hidden"
        />
      </GridSection>

      {/* A short last row leaves empty cells rather than filled ones. Dividers
          are pseudo-elements, not borders, so a neighbouring image can't
          round over them on half-pixel grid lines. */}
      <GridSection innerClassName="px-0 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={cn(
                "relative flex flex-col transition-colors hover:bg-muted/50",
                // Top divider: every card but the first row.
                "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-grid-border max-md:first:before:hidden md:[&:nth-child(-n+3)]:before:hidden",
                // Right divider: desktop only, not on the last column.
                "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:hidden after:w-px after:bg-grid-border md:after:block md:[&:nth-child(3n)]:after:hidden",
                index % 3 === 0 && "md:before:hidden"
              )}
            >
              {/* In flow rather than `fill`: an absolutely positioned image
                  lands on sub-pixel offsets and can cover the cell borders. */}
              <BlurImage
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={630}
                sizes="(min-width: 768px) 360px, 100vw"
                // The first card is the LCP element; the rest lazy-load.
                priority={index === 0}
                className="aspect-[1200/630] w-full object-cover"
              />
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  {post.category && (
                    <Badge variant="secondary" className="mb-3">
                      {post.category}
                    </Badge>
                  )}
                  <h2 className="line-clamp-2 font-display text-lg font-bold">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                </div>

                {post.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <time
                  dateTime={post.createdAt.toISOString()}
                  className="mt-4 text-sm text-muted-foreground"
                >
                  {formatDate(post.createdAt)}
                </time>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <p className="col-span-full flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <CornerDownRight className="size-4" />
              No posts published yet.
            </p>
          )}

          {/* Complete a short last row with empty cells so the dividers close
              off the grid instead of trailing into blank space. */}
          {posts.length > 0 &&
            Array.from({ length: (3 - (posts.length % 3)) % 3 }).map((_, i) => (
              <div
                key={`filler-${i}`}
                aria-hidden
                className={cn(
                  "relative hidden md:block",
                  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-grid-border md:[&:nth-child(-n+3)]:before:hidden",
                  "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:hidden after:w-px after:bg-grid-border md:after:block md:[&:nth-child(3n)]:after:hidden"
                )}
              />
            ))}
        </div>
      </GridSection>

      {pageCount > 1 && (
        <GridSection innerClassName="py-6">
          <Pagination
            page={page}
            pageCount={pageCount}
            href={(n) => (n > 1 ? `/blog?page=${n}` : "/blog")}
          />
        </GridSection>
      )}
    </>
  )
}