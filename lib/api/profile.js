import { api, apiErrorMessage } from "@/lib/api/client"

/**
 * Saves the signed-in user's own profile.
 *
 * PATCH /auth/me takes multipart because the avatar is a file. The backend
 * accepts only `name` and `profile_image` — there is no bio field on the user
 * model — so anything else here would be silently stripped by its validation.
 */
export async function updateProfile(fields, imageFile) {
  const form = new FormData()
  if (fields.name !== undefined) form.append("name", fields.name)
  if (imageFile) form.append("profile_image", imageFile)

  const { data } = await api.patch("/auth/me", form)
  return data.data
}

export { apiErrorMessage }