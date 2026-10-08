// Admin section. No role check yet: there is no auth backend, so `/admin` is
// reachable by anyone.
//
// When you wire one up, this is the single place to protect every admin route:
//
//   const user = await requireSession()
//   if (user.role !== "admin") notFound()
//
// The nav section that links here is marked `module:admin` in config/nav.ts.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
