// Demo data. Nothing here reads a database or a session: every screen renders
// from the constants below, so the app runs with no backend at all.
//
// This is the single seam to replace with your own API. Keep the return types
// and the components keep working — that is the whole reason the seam lives in
// one file.

import { demoUsers, type DemoUser } from "@/modules/demo/users"

export type { DemoUser, UserRole } from "@/modules/demo/users"

// Stands in for `auth.api.getSession()`. The dashboard has no session check
// yet, so this is always the first demo user. Replace with a real lookup.
export function getSession(): { user: DemoUser } {
  return { user: demoUsers[0] }
}
