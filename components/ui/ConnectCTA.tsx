"use client";

import { siteConfig } from "@/lib/site";
import { trackEvent } from "@/lib/metrics";

function CoffeeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

/**
 * Subtle end-of-content invitation to book a 15-minute virtual coffee.
 * Client component only so the click can be recorded in site metrics.
 */
export default function ConnectCTA({ location }: { location: string }) {
  return (
    <aside
      className="mt-10 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <span
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-primary)" }}
      >
        <CoffeeIcon />
      </span>
      <div className="flex-1 flex flex-col gap-1">
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Coffee &amp; Connect
        </span>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-family-serif)",
          }}
        >
          Want to talk AI, Claude, or coaching opportunities? I keep 15 minutes
          open for a virtual coffee.
        </p>
      </div>
      <a
        href={siteConfig.author.calendly}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("cta_click", { cta: "coffee-connect", location })}
        className="self-start sm:self-center shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-dark)" }}
      >
        Book 15 minutes →
      </a>
    </aside>
  );
}
