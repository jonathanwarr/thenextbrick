import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "The Next Brick — AI Fluency, One Brick at a Time";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (constants — OG images render outside the CSS theme).
const BG = "#FAF8F5";
const SURFACE = "#F0EEE6";
const ACCENT = "#C28B70";
const TEXT = "#363430";
const MUTED = "#76746C";

export default function Image() {
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
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <div style={{ display: "flex", width: 40, height: 40, gap: 4, flexWrap: "wrap" }}>
            <div style={{ width: 18, height: 18, background: ACCENT, borderRadius: 3 }} />
            <div style={{ width: 18, height: 18, background: SURFACE, borderRadius: 3 }} />
            <div style={{ width: 18, height: 18, background: SURFACE, borderRadius: 3 }} />
            <div style={{ width: 18, height: 18, background: ACCENT, borderRadius: 3 }} />
          </div>
          The Next Brick
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: TEXT, lineHeight: 1.05 }}>
            {siteConfig.tagline}
          </div>
          <div style={{ fontSize: 30, color: MUTED, maxWidth: 900, lineHeight: 1.35 }}>
            Putting Claude to work for professionals who already have the craft.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
