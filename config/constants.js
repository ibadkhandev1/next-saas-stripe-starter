// Single place for every fixed value the app branches on.
//
// Two reasons this file exists rather than inline literals:
//   1. The backend has its own `src/constants/enums.js`; this is the same idea,
//      so the two sides can be read side by side.
//   2. A named constant can be imported, so "user" and "author" cannot drift
//      apart between a form and the check that validates it.

// Must match enums.user_roles in blogger-backend/src/constants/enums.js.
export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
})

// Must match enums.blog_status in the backend.
export const POST_STATUSES = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
})

// Icon names for the dashboard sidebar. NavItem.icon is typed by this list, so
// a typo is a compile error rather than a blank glyph.
export const NAV_ICONS = Object.freeze([
  "dashboard",
  "posts",
  "trash",
  "profile",
  "shield",
  "users",
])

// Where the Express backend lives, server-side only. The browser talks to the
// /api/[...path] proxy in this app instead, which keeps the API private and the
// cookies same-origin.
export const API_URL = process.env.API_URL

export const API_PREFIX = "/api"

// Cookie names, set by the backend. These must match
// src/lib/auth-token.js on the other side.
export const ACCESS_COOKIE = "access_token"
export const REFRESH_COOKIE = "refresh_token"

// Post form limits, mirrored from src/validation/blog.validation.js on the
// backend. If these drift, a form that says "valid" gets a 400 — keep them in
// step.
export const POST_LIMITS = Object.freeze({
  TITLE_MIN: 10,
  TITLE_MAX: 500,
  DESCRIPTION_MIN: 50,
  DESCRIPTION_MAX: 5000,
  TAGS_MIN: 1,
  TAGS_MAX: 10,
  CATEGORY_MIN: 4,
  CATEGORY_MAX: 100,
})

export const POST_STATUS_OPTIONS = Object.freeze([
  { value: POST_STATUSES.DRAFT, label: "Draft" },
  { value: POST_STATUSES.PUBLISHED, label: "Published" },
])

export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 20

// Profile limits, mirrored from authSchema in the backend's
// src/validation/auth.validation.js. The edit endpoint accepts only `name` and
// `profile_image` — there is no bio field on the user model.
export const PROFILE_LIMITS = Object.freeze({
  NAME_MIN: 2,
  NAME_MAX: 50,
})

// Upload guard, matching MAX_FILE_SIZE in the backend's constants.js.
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
])

// Three cards on the homepage and blog index: a full row of the grid.
export const HOME_FEATURED_POSTS = 3
export const POST_PAGE_SIZE = 9
export const CHANGELOG_PAGE_SIZE = 10
