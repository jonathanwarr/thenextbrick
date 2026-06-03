import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated and transactional surfaces — keep out of the index.
      disallow: ["/admin", "/login", "/auth", "/subscribe/confirm", "/subscribe/unsubscribe"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
