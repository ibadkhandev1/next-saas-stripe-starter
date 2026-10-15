import { USER_ROLES } from "@/config/constants"
import { requireRole } from "@/lib/auth/session"

// Guards every route below: /admin, /admin/posts and /admin/users.
//
// It 404s rather than redirecting, so an admin URL is not advertised to anyone
// else in the response or in search results.
//
// The backend defaults every new account to "user", so this is a 404 for
// everyone until someone is promoted. Run `npm run create-admin` in the backend
// repo to promote one account.
export default async function AdminLayout({ children }) {
  await requireRole(USER_ROLES.ADMIN)
  return children
}