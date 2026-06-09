import Link from "next/link";

export type Category = "foundations" | "playbooks" | "essays";

export interface BrickCardProps {
  title: string;
  date: string;
  category: Category;
  tags: string[];
  slug: string;
  excerpt?: string;
  theBrick?: string;
  className?: string;
  featured?: boolean;
}

export const categoryColors: Record<Category, string> = {
  foundations: "var(--color-primary)",
  playbooks: "var(--color-secondary)",
  essays: "var(--color-primary)",
};

export const categoryLabels: Record<Category, string> = {
  foundations: "Foundations",
  playbooks: "Playbooks",
  essays: "Essays",
};

export function CategoryIcon({ category }: { category: Category }) {
  if (category === "foundations") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }
  if (category === "playbooks") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export default function BrickCard({
  title,
  date,
  category,
  tags,
  slug,
  excerpt,
  theBrick,
  className = "",
  featured = false,
}: BrickCardProps) {
  const accentColor = categoryColors[category];

  if (featured) {
    return (
      <Link
        href={`/bricks/${slug}`}
        className={`group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderTop: `4px solid ${accentColor}`,
        }}
      >
        <div className="flex flex-col gap-3 p-5 lg:p-6 flex-1">
          {/* Category badge + date */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full font-family-sans"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-dark)" }}
            >
              <CategoryIcon category={category} />
              {categoryLabels[category]}
            </span>
            <span
              className="text-base font-semibold font-family-serif"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {date}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-card-feature font-bold group-hover:opacity-70 transition-opacity"
          >
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p
              className="text-sm leading-relaxed line-clamp-2 font-family-serif"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {excerpt}
            </p>
          )}

          {/* The Brick — value prop, sized to its content so spare card
              height becomes negative space instead of inflating the box.
              Bows out in the snuggest locked band where it can't fit. */}
          {theBrick && (
            <div
              className="flex flex-col gap-2.5 rounded-lg px-5 py-4 lock-snug:hidden"
              style={{
                backgroundColor: "var(--color-bg)",
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-wider font-family-sans"
                style={{ color: "var(--color-text-secondary)" }}
              >
                The Brick
              </span>
              <p
                className="text-xl leading-relaxed line-clamp-6 lock-tight:line-clamp-2 font-family-serif"
                style={{ color: "var(--color-text-primary)" }}
              >
                {theBrick}
              </p>
            </div>
          )}

          {/* Tags + CTA pinned to the card bottom as one group. Tags hide
              across the whole tight band; in lock-trim the two-line Brick
              box uses up the CTA's room too, so the group steps aside
              rather than crop. */}
          <div className="mt-auto flex flex-col gap-3 pt-1 lock-trim:hidden">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 lock-tight:hidden">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div>
              <span
                className="text-sm font-semibold transition-opacity group-hover:opacity-70"
                style={{ color: "var(--color-text-primary)" }}
              >
                Read article →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Standard card
  return (
    <Link
      href={`/bricks/${slug}`}
      className={`group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div className="flex flex-col gap-2 p-4 lg:p-5 flex-1">
        {/* Category + date */}
        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide font-family-sans"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <CategoryIcon category={category} />
            {categoryLabels[category]}
          </span>
          <span className="text-sm font-family-serif" style={{ color: "var(--color-text-secondary)" }}>
            {date}
          </span>
        </div>

        {/* Title */}
        <p
          className="text-base font-medium leading-snug line-clamp-3 group-hover:opacity-70 transition-opacity font-family-serif"
          style={{ minHeight: "calc(3 * 1.375em)" }}
        >
          {title}
        </p>

        {/* Excerpt — steps aside in the tight locked band so the card
            truncates at a line boundary instead of cropping mid-glyph */}
        {excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-2 lock-tight:hidden font-family-serif"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
