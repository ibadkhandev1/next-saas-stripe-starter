import { ACCESS_COOKIE, API_URL } from "@/config/constants"
// Proxies the browser's API calls to the Express backend.
//
// Two reasons this exists rather than calling Express from the browser:
//   1. The refresh cookie is scoped to `path=/api/auth`, so auth requests have
//      to go through a path with that prefix anyway.
//   2. The API URL never reaches the client, and the browser stays same-origin,
//      so no credentialed CORS setup is needed.
// Anything not listed in UPSTREAM_ROUTES is passed through unchanged. The two
// that matter are the prefixes Express mounts, since /api/... is our own path.
const UPSTREAM_ROUTES = {
  auth: "auth",
  blog: "blog",
}
// Headers the client sets that must reach Express untouched.
const FORWARDED_REQUEST_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "x-requested-with",
]
async function proxy(request, segments) {
  if (!API_URL) {
    return Response.json({ message: "API_URL is not set." }, { status: 500 })
  }
  const [prefix, ...rest] = segments
  const upstreamPath = UPSTREAM_ROUTES[prefix] ?? prefix
  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  const cookie = request.headers.get("cookie")
  if (cookie) {
    headers.set("cookie", cookie)
    if (!headers.has("authorization")) {
      const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
      if (accessToken) {
        headers.set("authorization", `Bearer ${accessToken}`)
      }
    }
  }
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer()
  const upstream = await fetch(
    `${API_URL}/api/${upstreamPath}/${rest.join("/")}`.replace(/\/$/, ""),
    {
      method: request.method,
      headers,
      // multipart bodies must stream through byte for byte, and auth answers
      // are per-visitor: nothing here may be cached.
      body: body && body.byteLength > 0 ? body : undefined,
      duplex: "half",
      cache: "no-store",
      redirect: "manual",
    }
  )
  const response = new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
  })
  // Everything except Set-Cookie passes on as a single value...
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return
    response.headers.set(key, value)
  })
  // ...but there can be several Set-Cookie headers, and the refresh cookie is
  // the whole reason login works.
  for (const cookie of upstream.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie)
  }
  return response
}
export async function GET(request, context) {
  return proxy(request, (await context.params).path)
}
export async function POST(request, context) {
  return proxy(request, (await context.params).path)
}
export async function PATCH(request, context) {
  return proxy(request, (await context.params).path)
}
export async function PUT(request, context) {
  return proxy(request, (await context.params).path)
}
export async function DELETE(request, context) {
  return proxy(request, (await context.params).path)
}
