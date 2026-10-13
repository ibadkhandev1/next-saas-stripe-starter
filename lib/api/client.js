"use client"
// One axios instance for the whole app.
//
// baseURL is `/api`, which is this project's catch-all proxy — not Express.
// The backend's cookies are scoped to `/api`, so they arrive on this origin
// automatically and no token ever passes through JavaScript.
//
// `withCredentials` is what lets the browser attach them at all.
import axios from "axios"
import { refreshSession } from "@/lib/auth/session-client"
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
})
/**
 * A 401 usually means a 15-minute-old access token, not a logged-out reader.
 * The refresh cookie is still there, so refresh once and replay the request.
 * `__retried` stops a second 401 from looping.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (error.response?.status !== 401 || !config || config.__retried) {
      return Promise.reject(error)
    }
    config.__retried = true
    if (!(await refreshSession())) return Promise.reject(error)
    return api.request(config)
  }
)
/**
 * The server's own message, so "email not verified" and "invalid password"
 * don't both collapse into one generic line.
 */
export function apiErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === "string" && message) return message
    if (error.code === "ERR_NETWORK") {
      return "Couldn't reach the server. Check your connection."
    }
  }
  return fallback
}
