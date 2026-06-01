import NewsletterForm from "./NewsletterForm";

interface NewsletterCTAProps {
  /** Where this signup originated — stored on the subscriber row. */
  source?: string;
  /** Optional extra classes for outer spacing in a given placement. */
  className?: string;
}

/**
 * The unified newsletter call-to-action band: a light surface card with the
 * title/subtitle on the left and the inline animated subscribe form on the
 * right. Used across the homepage, the bricks index, and brick articles so the
 * newsletter prompt looks identical everywhere.
 */
export default function NewsletterCTA({
  source = "site",
  className = "",
}: NewsletterCTAProps) {
  return (
    <section
      className={`rounded-2xl px-6 py-7 sm:px-8 ${className}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="md:max-w-xs">
          <h2
            className="text-xl sm:text-2xl font-medium leading-tight"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            The Next Brick Newsletter
          </h2>
          <p
            className="text-sm mt-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Build and maintain your skills with Claude.
          </p>
        </div>
        <div className="w-full md:flex-1 md:max-w-md">
          <NewsletterForm layout="horizontal" source={source} />
        </div>
      </div>
    </section>
  );
}
