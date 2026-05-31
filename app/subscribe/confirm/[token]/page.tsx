import { randomUUID } from "node:crypto";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createServiceClient } from "@/lib/supabase/server";

type ConfirmParams = Promise<{ token: string }>;

export default async function ConfirmSubscriptionPage({
  params,
}: {
  params: ConfirmParams;
}) {
  const { token } = await params;

  const supabase = createServiceClient();
  // The token column is NOT NULL, so we can't clear it. Rotate it to a fresh
  // UUID instead — this makes the confirmation link single-use (re-clicking
  // won't match) while keeping the column valid.
  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .update({
      status: "confirmed",
      confirmation_token: randomUUID(),
      confirmed_at: new Date().toISOString(),
    })
    .eq("confirmation_token", token)
    .select("email")
    .maybeSingle();

  const success = !error && subscriber?.email;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md text-center">
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
            className="text-4xl font-medium mb-4"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            {success ? "You're in." : "Link expired."}
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {success
              ? `Confirmed ${subscriber.email}. The next brick lands Monday.`
              : "This confirmation link is no longer valid. Try subscribing again."}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
