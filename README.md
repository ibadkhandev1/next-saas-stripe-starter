# Blogger

A blog and the dashboard that runs it, built with Next.js 16. The reading
experience is fully static. The dashboard renders from demo data, so the whole
thing runs with no backend at all.

- **No backend required.** Clone it, `npm run dev`, and every route answers. No database, no auth provider, no storage bucket.
- **One seam to your API.** `modules/demo/data.ts` and `modules/demo/posts.ts` hold every value the UI reads. Point them at your backend, keep the return types, and the components keep compiling.
- **Honest states.** Nothing pretends to work. Forms update local state and say so in a toast; an uploaded image warns that it only exists in your browser.

## Stack

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)            |
| Content   | MDX with Fumadocs (blog, legal pages)         |
| UI        | Tailwind CSS v4, Base UI                      |
| Icons     | lucide-react                                  |

## Getting started

```bash
git clone https://github.com/mickasmt/next-saas-stripe-starter
cd next-saas-stripe-starter
npm install
npm run dev
```

There's nothing to configure. The only environment variable worth setting is
`NEXT_PUBLIC_APP_URL`, used for canonical URLs, the sitemap and social cards.

## What's in it

**Public** — a homepage leading with the three most recent posts, an archive with category filters, a post page with a table of contents, and the terms and privacy pages.

**Dashboard** — overview with post counts, your posts with edit / delete / restore, a trash view, an account settings page (avatar, display name, bio), and login / sign-up / forgot-password screens.

**Admin** — `/admin` with blog-wide stats and recent activity, `/admin/posts` for every author's posts, and `/admin/users` for the user list. No role check yet: `app/(app)/admin/layout.tsx` holds the one place to add it.

### The dashboard screens

| Route                          | What it does                                        |
| ------------------------------ | --------------------------------------------------- |
| `/dashboard`                   | Counts and recently updated posts                    |
| `/dashboard/posts`             | Every live post, with preview, edit and delete       |
| `/dashboard/posts/new`         | The post form                                        |
| `/dashboard/posts/[id]`        | The same form, prefilled                             |
| `/dashboard/posts/trash`       | Deleted posts, with restore                          |
| `/dashboard/settings/profile`  | Avatar, display name, bio                            |
| `/login`, `/register`, `/forgot-password` | Auth screens — UI only, no endpoint wired |

### The post form

One form serves both create and edit. It collects title, description, tags,
category and a featured image. The image is picked from a library or uploaded
from your machine, never typed as a path.

Deleting a post is a soft delete: the content is kept and the post moves to the
trash, where it can be restored.

## Wiring your backend

Two files, and that's all:

| File                        | Replace                                        |
| --------------------------- | ---------------------------------------------- |
| `modules/demo/data.ts`      | `getSession()` — the signed-in user              |
| `modules/demo/posts.ts`     | `getPosts()`, `getTrashedPosts()`, `getPost()`  |

Keep the returned types. `Post` carries `id`, `slug`, `title`, `description`,
`tags`, `category`, `featuredImage`, `status`, `createdAt`, `updatedAt`,
`publishedAt` and `deletedAt` — the last one is what makes trash and restore
work.

Mutations are one function each, with a comment saying where the real call
goes:

| Action     | Where                                                     |
| ---------- | --------------------------------------------------------- |
| Create     | `components/dashboard/posts/new-post-view.tsx`            |
| Update     | `components/dashboard/posts/post-editor.tsx`              |
| Delete     | `components/dashboard/posts/posts-table.tsx` → `deletePost` |
| Restore    | `components/dashboard/posts/posts-table.tsx` → `restorePost` |
| Sign in    | `components/auth/login-form.tsx` → `submit`                |

Add `requireSession()` to `app/(app)/layout.tsx` to start protecting the
dashboard, and route-level auth to `app/(auth)/*` for the redirects.

## Modules

`config/features.ts` lists what this project is made of, and
`npm run modules:prune <module...>` deletes a module for good: its files, the
code marked for it in shared files, and its packages. Without `--yes` the
command only prints what it would delete.

Modules that depend on another are pruned together.

| Module  | Routes     | What it covers                       |
| ------- | ---------- | ------------------------------------ |
| `auth`  | `/dashboard` | Dashboard shell and account settings |
| `blog`  | `/blog`      | MDX archive, post pages and filters   |

Code that belongs to a single module lives in a path listed in that module's
`files`. Code inside a shared file gets a marker — `// module:<key>` on a line,
or `// module:<key> start` / `end` around a block — so the prune removes it too.

## Project structure

```
app/          Routes: (marketing), (auth), (app)
components/   UI: marketing, dashboard, auth, shared, ui
config/       Site, blog, media, modules, navigation
content/      MDX: blog, legal
lib/          Metadata, content sources, helpers
modules/      Demo data — the seam to your backend
```

## Scripts

| Command                                | What it does                 |
| -------------------------------------- | ---------------------------- |
| `npm run dev`                          | Start the dev server         |
| `npm run build`                        | Production build             |
| `npm run typecheck`                    | Types, no emit               |
| `npm run lint`                         | ESLint                       |
| `npm run format`                       | Prettier                     |
| `npm run modules:prune <module...>`    | Delete a module for good     |

## Metadata and SEO

Titles, descriptions, canonical URLs and social cards come from
`lib/metadata.ts`; the site-wide card is generated in `app/opengraph-image.tsx`.
`app/sitemap.ts` lists the public pages and `app/robots.ts` keeps the dashboard
and API out of search results. Set `NEXT_PUBLIC_APP_URL` to your domain so every
absolute URL resolves.

## License

MIT — see [LICENSE.md](LICENSE.md).