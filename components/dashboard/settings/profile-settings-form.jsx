"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { SectionCard } from "@/components/dashboard/section-card"
import { SaveCard } from "@/components/dashboard/settings/save-card"
import { ImagePicker } from "@/components/shared/image-picker"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiErrorMessage, updateProfile } from "@/lib/api/profile"
import { PROFILE_LIMITS } from "@/config/constants"

/**
 * Display name and avatar. Both go to PATCH /auth/me.
 *
 * There is no bio field: the backend's user model has none, and its edit
 * endpoint only accepts `name` and `profile_image`.
 */
export function ProfileSettingsForm({ user }) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [avatar, setAvatar] = useState(user.image ?? "")
  const [savingField, setSavingField] = useState(null)

  // The avatar renders from the current value, so picking updates it before a
  // save rather than only after.
  const previewUser = { name: name || user.name, image: avatar || null }

  async function saveName() {
    const trimmed = name.trim()
    if (trimmed.length < PROFILE_LIMITS.NAME_MIN) {
      toast.error(
        `Name needs at least ${PROFILE_LIMITS.NAME_MIN} characters.`
      )
      return
    }

    setSavingField("name")
    try {
      await updateProfile({ name: trimmed })
      toast.success("Display name updated.")
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't update your name."))
    } finally {
      setSavingField(null)
    }
  }

  async function saveAvatar(file) {
    if (!file) return

    setSavingField("avatar")
    try {
      const updated = await updateProfile({}, file)
      // The API answers with the saved user, so show the stored URL rather than
      // the blob preview, which dies with this tab.
      if (updated?.profile_image) setAvatar(updated.profile_image)
      toast.success("Avatar updated.")
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't upload that avatar."))
    } finally {
      setSavingField(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Avatar"
        description="Shown next to your posts and on your profile."
        footer={<p>An avatar is optional but strongly recommended.</p>}
      >
        <div className="flex items-center gap-4">
          <span aria-hidden className="shrink-0">
            <UserAvatar
              user={previewUser}
              fallbackClassName="text-lg"
              className="size-12"
            />
          </span>

          <div className="min-w-0 flex-1">
            <ImagePicker
              id="avatar"
              label="Avatar image"
              value={avatar}
              onChange={setAvatar}
              onFileChange={saveAvatar}
              // Upload only: the API takes a file, and a library of stock photos
              // would be anyone else's face on your profile.
              library={[]}
              aspect="square"
            />
          </div>
        </div>
        {savingField === "avatar" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Uploading…
          </p>
        )}
      </SectionCard>

      <SaveCard
        title="Display Name"
        description="How you're credited on every post you publish."
        hint={`${name.length}/${PROFILE_LIMITS.NAME_MAX} characters.`}
        dirty={name.trim() !== user.name && name.trim().length > 0}
        pending={savingField === "name"}
        onSave={saveName}
      >
        <div className="max-w-[300px]">
          <Label htmlFor="display-name" className="sr-only">
            Display name
          </Label>
          <Input
            id="display-name"
            value={name}
            maxLength={PROFILE_LIMITS.NAME_MAX}
            aria-invalid={name.trim().length > 0 && name.trim().length < PROFILE_LIMITS.NAME_MIN}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </SaveCard>

      <SectionCard
        title="Email"
        description="The address notifications are sent to."
        footer={<p>Email changes need verification on your backend.</p>}
      >
        <div className="flex max-w-md items-center gap-2 rounded-md border bg-background px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate">{user.email}</span>
          {user.emailVerified && <Badge variant="secondary">Verified</Badge>}
          <Badge variant="outline">Primary</Badge>
        </div>
      </SectionCard>
    </div>
  )
}