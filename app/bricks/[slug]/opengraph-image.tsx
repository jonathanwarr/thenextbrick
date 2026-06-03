import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts/queries";
import { categoryLabels } from "@/components/ui/BrickCard";
import { siteConfig } from "@/lib/site";

export const alt = "The Next Brick article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#FAF8F5";
const SURFACE = "#F0EEE6";
const ACCENT = "#C28B70";
const TEXT = "#363430";
const MUTED = "#76746C";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? siteConfig.name;
  const category = post ? categoryLabels[post.category] : "";
  // Keep very long titles from overflowing the canvas.
  const displayTitle = title.length > 110 ? `${title.slice(0, 107).trimEnd()}…` : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BG,
          padding: "72px 80px",
          borderTop: `16px solid ${ACCENT}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <div style={{ display: "flex", width: 36, height: 36, gap: 3, flexWrap: "wrap" }}>
            <div style={{ width: 16, height: 16, background: ACCENT, borderRadius: 3 }} />
            <div style={{ width: 16, height: 16, background: SURFACE, borderRadius: 3 }} />
            <div style={{ width: 16, height: 16, background: SURFACE, borderRadius: 3 }} />
            <div style={{ width: 16, height: 16, background: ACCENT, borderRadius: 3 }} />
          </div>
          The Next Brick
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: TEXT,
                background: ACCENT,
                padding: "8px 20px",
                borderRadius: 999,
              }}
            >
              {category}
            </div>
          ) : null}
          <div style={{ fontSize: 64, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>
            {displayTitle}
          </div>
        </div>

        <div style={{ fontSize: 26, color: MUTED }}>{siteConfig.tagline}</div>
      </div>
    ),
    { ...size },
  );
}
