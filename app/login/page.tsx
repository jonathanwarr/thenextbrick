import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { signInWithEmail } from "./actions";

type LoginSearchParams = Promise<{ sent?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const errorMessage = params.error;

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
            Sign in
          </p>
          <h1 className="text-4xl font-medium mb-3" style={{ fontFamily: "var(--font-family-serif)" }}>
            Welcome back.
          </h1>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Enter the email associated with your account and we&apos;ll send you a magic link.
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
                  We&apos;ve sent a magic link to your email. Click it to finish signing in.
                </p>
              </div>
            ) : (
              <form action={signInWithEmail} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-medium mb-2">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-full font-medium transition-opacity hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Send magic link
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
