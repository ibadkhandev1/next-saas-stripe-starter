import defaultMdxComponents from "fumadocs-ui/mdx"
import Image from "next/image"
import { Callout } from "@/components/content/callout"
// Shared by blog and legal pages. Pass page-specific overrides (e.g.
// relative links) as `components`.
export function getMDXComponents(components) {
  return {
    ...defaultMdxComponents,
    Image,
    Callout,
    ...components,
  }
}
