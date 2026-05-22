import Link from "next/link";

export type BrickyardStatus = "shipped" | "publishing" | "drafting";

export interface BrickyardCardProps {
  title: string;
  date: string;
  status: BrickyardStatus;
  tags: string[];
  slug?: string;
}

const statusConfig: Record<BrickyardStatus, { bg: string; label: string; shadow: boolean }> = {
  shipped: {
    bg: "var(--color-shipped)",
    label: "Shipped",
    shadow: false,
  },
  publishing: {
    bg: "var(--color-publishing)",
    label: "Publishing",
    shadow: true,
  },
  drafting: {
    bg: "var(--color-drafting)",
    label: "Drafting",
    shadow: false,
  },
};

export default function BrickyardCard({ title, date, status, tags, slug }: BrickyardCardProps) {
  const config = statusConfig[status];
  const isLinkable = status !== "drafting" && slug;

  const card = (
    <div
      className="flex flex-col gap-2.5 p-4 rounded-xl h-full"
      style={{
        backgroundColor: config.bg,
        boxShadow: config.shadow ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
        border: config.shadow ? "1px solid rgba(255,255,255,0.3)" : "none",
      }}
    >
      {/* Date + status */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-xl font-bold leading-tight font-family-serif"
          style={{ color: "var(--color-dark)" }}
        >
          {date}
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider shrink-0 mt-1"
          style={{ color: "var(--color-dark)" }}
        >
          {config.label}
        </span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: "var(--color-dark-subtle)",
                color: "var(--color-dark)",
                opacity: status === "drafting" ? 0.7 : 1,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p
        className="text-sm font-medium leading-snug font-family-serif"
        style={{
          color: "var(--color-dark)",
          opacity: status === "drafting" ? 0.6 : 1,
        }}
      >
        {title}
      </p>
    </div>
  );

  if (isLinkable) {
    return (
      <Link
        href={`/bricks/${slug}`}
        className="block transition-all duration-200 hover:-translate-y-0.5"
      >
        {card}
      </Link>
    );
  }

  return <div className="cursor-default">{card}</div>;
}
