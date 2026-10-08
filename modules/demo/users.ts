// Demo users. Posts reference these by id (`authorId`), so the admin views can
// show who wrote what without duplicating names.
//
// Keep `getSession()` in data.ts pointing at the first entry: that is the
// signed-in user the dashboard renders.

export type UserRole = "admin" | "author"

export type DemoUser = {
  id: string
  name: string
  email: string
  bio: string
  role: UserRole
  image: string | null
  emailVerified: boolean
  joinedAt: Date
}

export const demoUsers: DemoUser[] = [
  {
    id: "demo-user",
    name: "Ada Lovelace",
    email: "ada@example.com",
    bio: "I write about shipping software and the decisions behind it.",
    role: "admin",
    image: null,
    emailVerified: true,
    joinedAt: new Date("2026-01-15"),
  },
  {
    id: "demo-user-2",
    name: "Grace Hopper",
    email: "grace@example.com",
    bio: "Debugging, compilers and the tools that make them bearable.",
    role: "author",
    image: "/_static/avatars/shadcn.jpeg",
    emailVerified: true,
    joinedAt: new Date("2026-02-03"),
  },
  {
    id: "demo-user-3",
    name: "Alan Turing",
    email: "alan@example.com",
    bio: "Long essays on computation, mostly unfinished.",
    role: "author",
    image: "/_static/avatars/mickasmt.webp",
    emailVerified: true,
    joinedAt: new Date("2026-03-21"),
  },
]

export function getUser(id: string): DemoUser | undefined {
  return demoUsers.find((user) => user.id === id)
}

export function getUserName(id: string): string {
  return getUser(id)?.name ?? "Unknown author"
}
