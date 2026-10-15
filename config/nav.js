import { USER_ROLES } from "@/config/constants"

export const dashboardNav = [
  {
    items: [
      { title: "Overview", href: "/dashboard", icon: "dashboard" },
      { title: "Posts", href: "/dashboard/posts", icon: "posts" },
    ],
  },
  {
    title: "Manage",
    items: [
      { title: "Trash", href: "/dashboard/posts/trash", icon: "trash" },
      {
        title: "Profile",
        href: "/dashboard/settings/profile",
        icon: "profile",
      },
    ],
  },
  // module:admin start
  {
    title: "Admin",
    // Hidden from anyone who is not an admin. The /admin routes are separately
    // guarded by requireRole() in app/(app)/admin/layout.jsx — this is only
    // about not advertising them to people who would just get a 404.
    adminOnly: true,
    items: [
      { title: "Overview", href: "/admin", icon: "shield" },
      { title: "All posts", href: "/admin/posts", icon: "posts" },
      { title: "Users", href: "/admin/users", icon: "users" },
    ],
  },
  // module:admin end
]

/**
 * The sidebar sections this role should see.
 *
 * Called from the server layout so the admin links are absent from the markup
 * itself, rather than hidden with CSS after the fact.
 *
 * Pruning the admin module removes the `adminOnly` flags with it, and this
 * becomes a no-op — which is the intended outcome.
 */
export function getNavForRole(role) {
  const isAdmin = role === USER_ROLES.ADMIN
  return dashboardNav.filter((section) => isAdmin || !section.adminOnly)
}