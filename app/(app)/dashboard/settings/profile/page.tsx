import { PageContent } from "@/components/dashboard/page-header"
import { ProfileSettingsForm } from "@/components/dashboard/settings/profile-settings-form"
import { buildMetadata } from "@/lib/metadata"
import { getSession } from "@/modules/demo/data"

export const metadata = buildMetadata({
  title: "Profile",
  noIndex: true,
})

export default function ProfileSettingsPage() {
  const { user } = getSession()

  return (
    <PageContent>
      <ProfileSettingsForm user={user} />
    </PageContent>
  )
}
