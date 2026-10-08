"use client"

import { useState } from "react"
import { toast } from "sonner"

import { SectionCard } from "@/components/dashboard/section-card"
import { SaveCard } from "@/components/dashboard/settings/save-card"
import { ImagePicker } from "@/components/shared/image-picker"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { avatars } from "@/config/media"
import type { DemoUser } from "@/modules/demo/data"

const MAX_NAME_LENGTH = 60
const MAX_BIO_LENGTH = 200

// Demo mode: saving updates local state and confirms with a toast. Replace the
// three save handlers with your own mutations.
export function ProfileSettingsForm({ user }: { user: DemoUser }) {
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio)
  const [avatar, setAvatar] = useState(user.image ?? "")

  // The avatar renders from the current value, so picking updates it before a
  // save rather than only after.
  const previewUser = { name: name || user.name, image: avatar || null }

  function saveName() {
    toast.success("Display name updated.")
  }

  function saveBio() {
    toast.success("Bio updated.")
  }

  function saveAvatar() {
    toast.success("Avatar updated.")
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
              onChange={(value) => {
                setAvatar(value)
                if (value) saveAvatar()
              }}
              library={avatars}
              aspect="square"
            />
          </div>
        </div>
      </SectionCard>

      <SaveCard
        title="Display Name"
        description="How you're credited on every post you publish."
        hint={`Up to ${MAX_NAME_LENGTH} characters.`}
        dirty={name.trim() !== user.name && name.trim().length > 0}
        pending={false}
        onSave={saveName}
      >
        <div className="max-w-[300px]">
          <Label htmlFor="display-name" className="sr-only">
            Display name
          </Label>
          <Input
            id="display-name"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </SaveCard>

      <SaveCard
        title="Bio"
        description="A short introduction shown on your profile."
        hint={`${bio.length}/${MAX_BIO_LENGTH}.`}
        dirty={bio.trim() !== user.bio}
        pending={false}
        onSave={saveBio}
      >
        <div className="max-w-[520px]">
          <Label htmlFor="bio" className="sr-only">
            Bio
          </Label>
          <textarea
            id="bio"
            value={bio}
            rows={4}
            maxLength={MAX_BIO_LENGTH}
            placeholder="I write about shipping software and the decisions behind it."
            onChange={(event) => setBio(event.target.value)}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
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
