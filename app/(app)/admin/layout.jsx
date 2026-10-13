import { USER_ROLES } from "@/config/constants"
import { requireRole } from "@/lib/auth/session"
// Guards every route below: /admin, /admin/posts and /admin/users.
//
// Nobody holds the admin role yet — the backend defaults every new account to
// "user" — so these 404 for everyone today. Comment out the requireRole call to
// look around in development, and put it back before shipping.
export default async function AdminLayout({ children }) {
  await requireRole(USER_ROLES.ADMIN)
  return children
}
