/**
 * Central site identity used by metadata, JSON-LD, sitemap, robots, and OG
 * images. Keeping it in one place means the canonical URL, brand voice, and
 * author identity stay consistent across every SEO/GEO surface.
 */
export const siteConfig = {
  name: "The Next Brick",
  // Canonical public origin (no trailing slash). Mirrors NEXT_PUBLIC_SITE_URL.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextbrick.ai").replace(/\/+$/, ""),
  tagline: "AI Fluency. One Brick at a Time.",
  // Brand-true description: experienced operators, anti-hype, practical.
  description:
    "AI enablement for professionals who already have the craft. Practical, no-hype guidance on putting Claude to work — one concept, one application, one brick at a time.",
  author: {
    name: "Jonathan Warr",
    linkedin: "https://www.linkedin.com/in/jonathan-warr/",
  },
  locale: "en_US",
} as const;

/** Absolute URL for a site-relative path (e.g. "/bricks/x" → full URL). */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Serializes a JSON-LD object for a <script> tag, escaping `<` so a value can
 * never break out of the script element (`</script>` injection).
 */
export function jsonLdString(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
