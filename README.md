# Blogger

A blog and the dashboard that runs it. Next.js 16 frontend, Express API behind
it. The API is the only source of truth — there is no demo data and no local
fallback anywhere in the reading or writing paths.

## Stack

| Layer    | Choice                                         |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 16 (App Router, Turbopack), React 19    |
| Language | JavaScript (ES modules), no TypeScript          |
| API      | Express + MongoDB + Cloudinary (separate repo)   |
| UI       | Tailwind CSS v4, Base UI, lucide-react          |
| Content  | Author-entered HTML stored by the API           |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

The frontend needs the API to be running and reachable. Without it the public
pages render an empty state rather than an error.

### Environment

| Variable               | Required | What it does                                              |
| ---------------------- | -------- | --------------------------------------------------------- |
| `API_URL`              | yes      | Absolute URL of the Express backend, e.g. `http://localhost:3001`. Server-side only. |
| `NEXT_PUBLIC_APP_URL`  | no       | Public URL, used for canonical URLs, sitemap and social cards. Falls back to `localhost:3000`. |

The browser never talks to Express directly. Every call goes through the
catch-all proxy at `app/api/[...path]/route.js`, which keeps the API URL private,
keeps cookies same-origin, and promotes the httpOnly access cookie to an
`Authorization` header. See "Auth" below for why the cookie path matters.

## Routes

**Public** — `/` (three most recent posts), `/blog` (paginated archive with
category and tag filters), `/blog/[slug]`, `/terms`, `/privacy`.

**Auth** — `/login`, `/register`, `/forgot-password`, `/reset-password`.

**Dashboard** — `/dashboard` (counts and recent posts), `/dashboard/posts`
(create, edit, delete), `/dashboard/posts/[id]` (edit), `/dashboard/posts/trash`
(restore), `/dashboard/settings/profile`.

**Admin** — `/admin`, `/admin/posts`, `/admin/users`. Guarded by
`requireRole("admin")`, which returns a 404 to anyone else.

## How data flows

Server-rendered pages read through `lib/blogs.js` — the single module that knows
the API's response shape. It maps Express's snake_case to the camelCase the UI
uses and normalises timestamps to `Date`, so no page has to know about the
wire format.

Mutations go the other way: `lib/api/posts.js` wraps axios for create, update,
delete, restore and status changes. It also owns the 401-refresh-retry
behaviour, so a 15-minute-old access token refreshes once and replays instead of
bouncing the reader to the login screen.

### Auth

Both tokens are httpOnly cookies set by the backend. The **access cookie is
scoped to `/`**, not `/api`: a cookie's path decides which requests the browser
attaches it to, and Server Components read it off the incoming page request. Scoped
to `/api` it would reach the proxy but never a page request like
`GET /dashboard`, so every authenticated page would render as signed out. The
**refresh cookie stays at `/api/auth`**, because only the proxy needs it.

## Project structure

```
app/          Routes: (marketing), (auth), (app), and the /api proxy
components/   UI: marketing, dashboard, auth, content, shared, ui
config/       Site config, navigation, constants, module registry
content/      MDX: legal pages only
lib/          blog API client, auth session, theme, metadata, helpers
scripts/      Module pruning
```

## Scripts

| Command                             | What it does             |
| ----------------------------------- | ------------------------ |
| `npm run dev`                       | Start the dev server     |
| `npm run build`                     | Production build         |
| `npm run start`                     | Serve the production build |
| `npm run lint`                      | ESLint                   |
| `npm run format`                    | Prettier                 |
| `npm run modules:prune <module…>`   | Delete a module for good |

## Modules

`config/features.js` declares what the project is made of. `npm run
modules:prune <module…>` deletes a module: its files, the code marked for it in
shared files, and its packages. Without `--yes` it only prints what it would
remove. Code inside a shared file carries a marker — `// module:<key>` on a line,
or `// module:<key> start` / `end` around a block.

## Known gaps

- **`content` is not sanitised.** The article body is stored and rendered as
  HTML without going through a sanitiser. Every logged-in author can currently
  inject script into a post body. Add `sanitize-html` on the backend write path
  before opening registration to anyone but yourself.
- **`/admin/users` has no backend.** There is no users endpoint, so the page can
  only show author ids and post counts, derived from published posts.
- **OAuth is not implemented.** The "Continue with Google" button on the login
  screen has no handler.
- **Admin routes 404 for everyone.** The backend creates every account with
  `role: "user"`. Promote an account with `npm run create-admin` in the backend
  repo, or change the default there.