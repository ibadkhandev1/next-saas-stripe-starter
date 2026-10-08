// Registry of the modules this app is built from. `pnpm modules:prune <module…>`
// reads it to delete a module for good: its files, the code marked for it in
// shared files, and its packages. Modules that depend on a pruned module are
// pruned too. Marker syntax is documented in AGENTS.md.
//
// This file lists what exists, not what is switched on: every module's routes
// and links are always live.

type ModuleDefinition<Key extends string> = {
  label: string
  description: string
  // Pruning this module also prunes every module that lists it here.
  dependsOn?: readonly NoInfer<Key>[]
  // Pathnames the module serves. After a prune, a link still pointing at one
  // of them is reported.
  routes?: readonly string[]
  // What `pnpm modules:prune` deletes with the module. A path or package listed
  // by several modules is only deleted once all of them are pruned.
  files?: readonly string[]
  packages?: readonly string[]
}

function defineModules<Key extends string>(
  modules: Record<Key, ModuleDefinition<Key>>
) {
  return modules
}

export const modules = defineModules({
  auth: {
    label: "Authentication",
    description: "Sign-in, sign-up and the dashboard.",
  },
  blog: {
    label: "Blog",
    description: "MDX articles with authors and categories.",
    files: [
      "app/(marketing)/blog",
      "lib/content/blog.ts",
      "content/blog",
      "public/_static/blog",
      "public/_static/avatars",
      "config/blog.ts",
      "components/marketing/category-tabs.tsx",
    ],
    routes: ["/blog"],
  },
  // module:admin start
  admin: {
    label: "Admin panel",
    description: "Blog-wide stats, every author's posts and the user list.",
    files: ["app/(app)/admin", "modules/demo/users.ts"],
    routes: ["/admin", "/admin/posts", "/admin/users"],
  },
  // module:admin end
})

export type ModuleKey = keyof typeof modules

export const moduleKeys = Object.keys(modules) as ModuleKey[]

export function isModuleKey(value: unknown): value is ModuleKey {
  return typeof value === "string" && Object.hasOwn(modules, value)
}
