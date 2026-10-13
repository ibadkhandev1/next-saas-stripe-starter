import { PageContent } from "@/components/dashboard/page-header"
import { ProfileSettingsForm } from "@/components/dashboard/settings/profile-settings-form"
import { requireSession } from "@/lib/auth/session"
import { buildMetadata } from "@/lib/metadata"
export const metadata = buildMetadata({
  title: "Profile",
  noIndex: true,
})
export default async function ProfileSettingsPage() {
  const { user } = await requireSession()
  return (
    <PageContent>
      <ProfileSettingsForm user={user} />
    </PageContent>
  )
}
