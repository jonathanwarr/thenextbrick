import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function SubscribePage() {
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
            Subscribe
          </p>
          <h1
            className="text-title font-medium mb-3"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            One brick at a time.
          </h1>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Weekly essays on building with Claude. Every Monday.
          </p>

          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
            }}
          >
            <NewsletterForm layout="vertical" source="subscribe-page" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
