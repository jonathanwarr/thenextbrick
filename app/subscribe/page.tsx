import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { subscribe } from "./actions";

type SubscribeSearchParams = Promise<{
  email?: string;
  sent?: string;
  already?: string;
  error?: string;
}>;

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: SubscribeSearchParams;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const already = params.already === "1";
  const errorMessage = params.error;
  const prefilledEmail = params.email ?? "";

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
            className="text-4xl font-medium mb-3"
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
            {sent ? (
              <div>
                <p
                  className="text-xs uppercase mb-3"
                  style={{
                    letterSpacing: "var(--tracking-label)",
                    color: "var(--color-primary)",
                  }}
                >
                  Check your inbox
                </p>
                <p style={{ color: "var(--color-text-secondary)" }}>
                  We&apos;ve sent a confirmation link. Tap it to finish subscribing.
                </p>
              </div>
            ) : already ? (
              <div>
                <p
                  className="text-xs uppercase mb-3"
                  style={{
                    letterSpacing: "var(--tracking-label)",
                    color: "var(--color-primary)",
                  }}
                >
                  Already subscribed
                </p>
                <p style={{ color: "var(--color-text-secondary)" }}>
                  This email is already on the list. See you Monday.
                </p>
              </div>
            ) : (
              <form action={subscribe} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium mb-2">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    defaultValue={prefilledEmail}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </label>
                <input type="hidden" name="source" value="subscribe-page" />
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-full font-medium transition-opacity hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Subscribe
                </button>
              </form>
            )}

            {errorMessage && (
              <p
                className="mt-4 text-sm"
                style={{ color: "var(--color-primary)" }}
              >
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
