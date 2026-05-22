import { headers } from "next/headers";
import { listPublishedPosts } from "@/lib/posts/queries";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  const posts = await listPublishedPosts({ limit: 50 });

  const items = posts
    .map((p) => {
      const url = `${origin}/bricks/${p.slug}`;
      const pubDate = p.publishedAt
        ? p.publishedAt.toUTCString()
        : new Date().toUTCString();
      return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.dek ? `<description>${escape(p.dek)}</description>` : ""}
      ${p.tags.map((t) => `<category>${escape(t)}</category>`).join("")}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Next Brick</title>
    <link>${origin}</link>
    <description>Claude fluency, one brick at a time.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
