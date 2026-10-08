export type NavIcon =
  "dashboard" | "posts" | "trash" | "profile" | "shield" | "users"

export type NavItem = {
  title: string
  href: string
  // Icon name, not a component: nav items are passed to client components.
  icon?: NavIcon
}

export type NavSection = {
  title?: string
  items: NavItem[]
}

export const dashboardNav: NavSection[] = [
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
    items: [
      { title: "Overview", href: "/admin", icon: "shield" },
      { title: "All posts", href: "/admin/posts", icon: "posts" },
      { title: "Users", href: "/admin/users", icon: "users" },
    ],
  },
  // module:admin end
]
