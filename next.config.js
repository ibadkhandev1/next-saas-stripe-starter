import { createMDX } from "fumadocs-mdx/next"

const nextConfig = {
  // Keep the bottom-left corner free for the dashboard user menu.
  devIndicators: { position: "bottom-right" },
  images: {
    // Blog covers now live on Cloudinary, not in /public. Remote hosts have to
    // be allowed explicitly or next/image refuses to load them.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Google's popup sign-in flow opens a cross-origin popup and polls
        // window.closed on it to notice when the reader dismisses it. Under
        // Cross-Origin-Opener-Policy: same-origin that read is blocked, the
        // watcher throws, and sign-in hangs with no error. This value keeps the
        // opener relationship while still isolating the browsing context group.
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ]
  },
}

const plugins = [
  // Legal pages are declared with the macro API in lib/content, so no
  // source.config.js or generated files are needed.
  createMDX(),
]

export default plugins.reduce((config, plugin) => plugin(config), nextConfig)