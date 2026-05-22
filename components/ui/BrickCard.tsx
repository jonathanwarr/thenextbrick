import Link from "next/link";

export type Category = "foundations" | "builds" | "observations" | "essays";

export interface BrickCardProps {
  title: string;
  date: string;
  category: Category;
  tags: string[];
  slug: string;
  excerpt?: string;
  className?: string;
  featured?: boolean;
}

export const categoryColors: Record<Category, string> = {
  foundations: "var(--color-primary)",
  builds: "var(--color-secondary)",
  observations: "var(--color-shipped)",
  essays: "var(--color-drafting)",
};

export const categoryLabels: Record<Category, string> = {
  foundations: "Foundations",
  builds: "Builds",
  observations: "Observations",
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
  if (category === "builds") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (category === "observations") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3.273-7 10-7 10 7 10 7-3.273 7-10 7S2 12 2 12z" />
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
        <div className="flex flex-col gap-3 p-5 flex-1">
          {/* Category badge + date */}
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-family-sans"
              style={{ backgroundColor: accentColor, color: "var(--color-dark)" }}
            >
              <CategoryIcon category={category} />
              {categoryLabels[category]}
            </span>
            <span
              className="text-sm font-family-serif"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {date}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-xl md:text-2xl font-bold leading-snug group-hover:opacity-70 transition-opacity"
          >
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p
              className="text-sm leading-relaxed line-clamp-3 font-family-serif"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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

          {/* CTA */}
          <div className="mt-auto pt-1">
            <span
              className="text-sm font-semibold transition-opacity group-hover:opacity-70"
              style={{ color: "var(--color-text-primary)" }}
            >
              Read article →
            </span>
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
      <div className="flex flex-col gap-2 p-4 flex-1">
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

        {/* Excerpt */}
        {excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-2 font-family-serif"
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
