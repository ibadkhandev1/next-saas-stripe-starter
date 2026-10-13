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
}

const plugins = [
  // Legal pages are declared with the macro API in lib/content, so no
  // source.config.js or generated files are needed.
  createMDX(),
]

export default plugins.reduce((config, plugin) => plugin(config), nextConfig)