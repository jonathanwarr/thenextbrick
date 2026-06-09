import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Shared page chrome for the subscribe-lifecycle result pages (confirm /
 * unsubscribe / their done states). Mirrors the visual style of
 * `app/subscribe/page.tsx` (centered card column, label eyebrow, serif H1) so
 * every state in the flow reads as one family. Pages drop their body copy —
 * and, where relevant, a confirm/unsubscribe button form — into `children`.
 */
export default function SubscribeMessage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <p
            className="text-xs uppercase mb-4"
            style={{
              letterSpacing: "var(--tracking-label)",
              color: "var(--color-text-muted)",
            }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-title font-medium mb-3"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            {title}
          </h1>
          {children ? (
            <div
              className="mt-4 leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {children}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
