import { api, apiErrorMessage } from "@/lib/api/client"

/** Turns the form's fields into the multipart body the backend expects. */
export function toBlogFormData(values, imageFile) {
  const form = new FormData()
  form.append("title", values.title)
  form.append("description", values.description)
  form.append("content", values.content ?? "")
  form.append("category", values.category)
  // Comma separated, exactly as typed — the backend splits and trims.
  form.append("tags", values.tags)
  if (imageFile) form.append("featured_image", imageFile)
  return form
}

export async function createPost(values, imageFile) {
  const { data } = await api.post("/blog", toBlogFormData(values, imageFile))
  return data.data
}

export async function updatePost(id, values, imageFile) {
  const { data } = await api.patch(
    `/blog/${id}`,
    toBlogFormData(values, imageFile)
  )
  return data.data
}

export async function deletePost(id) {
  await api.delete(`/blog/${id}`)
}

export async function restorePost(id) {
  // The endpoint takes one post per call — `{ id }`, not a list.
  await api.post("/blog/restore", { id })
}

export async function setPostStatus(id, status) {
  await api.patch(`/blog/${id}/status`, { status })
}

export { apiErrorMessage }