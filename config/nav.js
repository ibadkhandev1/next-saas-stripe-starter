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
    items: [
      { title: "Overview", href: "/admin", icon: "shield" },
      { title: "All posts", href: "/admin/posts", icon: "posts" },
      { title: "Users", href: "/admin/users", icon: "users" },
    ],
  },
  // module:admin end
]
