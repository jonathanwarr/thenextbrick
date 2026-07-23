import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConnectLinks from "@/components/ui/ConnectLinks";

export const metadata: Metadata = {
  title: "Let's Connect",
  description:
    "Connect with Jon Warr — book a 15-minute coffee & connect, reach out on LinkedIn or by email, or explore coaching and consulting at amwarr.com.",
  alternates: { canonical: "/connect" },
};

export default function ConnectPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 pt-page-top pb-12 flex flex-col">
        {/* Editorial rule eyebrow */}
        <div
          className="flex items-center gap-4 mb-5 shrink-0"
          style={{ animation: "fadeUp 0.5s ease both", animationDelay: "0ms" }}
        >
          <span
            className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
            style={{ color: "var(--color-text-muted)", letterSpacing: "0.18em" }}
          >
            Let&apos;s Connect · Coffee, Claude &amp; Customer Success
          </span>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: "var(--color-border)" }}
          />
        </div>

        <section
          className="w-full max-w-2xl"
          style={{ animation: "fadeUp 0.5s ease both", animationDelay: "80ms" }}
        >
          <h1
            className="text-display-lg font-medium tracking-tight"
            style={{
              fontFamily: "var(--font-family-serif)",
              color: "var(--color-primary)",
            }}
          >
            Let&apos;s connect.
          </h1>

          <div
            className="h-px w-12 mt-5 mb-4"
            style={{ backgroundColor: "var(--color-primary)" }}
          />

          <div
            className="space-y-3 text-base leading-relaxed"
            style={{
              fontFamily: "var(--font-family-serif)",
              color: "var(--color-text-primary)",
            }}
          >
            <p>
              If there&apos;s one thing I enjoy more than building with{" "}
              <span style={{ color: "var(--color-primary)" }}>Claude</span>, it&apos;s
              helping other people get good at it. Training and enablement are where
              I light up — taking a professional from AI-curious to AI-fluent, one
              brick at a time.
            </p>
            <p>
              Whether you want to trade notes on Claude, talk through an enablement
              challenge in customer success, or explore coaching opportunities,
              I&apos;d genuinely love to hear from you. Pick whichever door suits you
              best.
            </p>
          </div>
        </section>

        <section
          className="mt-8 w-full max-w-3xl"
          style={{ animation: "fadeUp 0.5s ease both", animationDelay: "160ms" }}
        >
          <ConnectLinks />
        </section>
      </main>

      <Footer />
    </div>
  );
}
