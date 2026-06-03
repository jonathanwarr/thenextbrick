import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/posts/queries";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();

  const articles: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteConfig.url}/bricks/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const latest = posts[0]?.updatedAt ?? posts[0]?.publishedAt ?? undefined;

  return [
    { url: siteConfig.url, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/bricks`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/about`, changeFrequency: "yearly", priority: 0.5 },
    ...articles,
  ];
}
