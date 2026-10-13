// Registry of the modules this app is built from. `npm run modules:prune <module...>`
// reads it to delete a module for good: its files, the code marked for it in
// shared files, and its packages. Modules that depend on a pruned module are
// pruned too. Marker syntax is documented in AGENTS.md.
//
// This file lists what exists, not what is switched on: every module's routes
// and links are always live.
function defineModules(modules) {
  return modules
}
export const modules = defineModules({
  auth: {
    label: "Authentication",
    description: "Sign-in, sign-up and the dashboard.",
  },
  blog: {
    label: "Blog",
    description: "Articles served by the Express API, plus the write UI.",
    files: [
      "app/(marketing)/blog",
      "lib/blogs.js",
      "components/marketing/category-tabs.jsx",
    ],
    packages: ["fumadocs-mdx"],
    routes: ["/blog"],
  },
  // module:admin start
  admin: {
    label: "Admin panel",
    description: "Blog-wide stats, every author's posts and the user list.",
    files: ["app/(app)/admin"],
    routes: ["/admin", "/admin/posts", "/admin/users"],
  },
  // module:admin end
})
export const moduleKeys = Object.keys(modules)
export function isModuleKey(value) {
  return typeof value === "string" && Object.hasOwn(modules, value)
}
