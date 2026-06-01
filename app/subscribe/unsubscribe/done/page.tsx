import Link from "next/link";
import SubscribeMessage from "@/components/ui/SubscribeMessage";

export const metadata = {
  title: "Unsubscribed — The Next Brick",
  robots: { index: false },
};

/**
 * Static confirmation shown after a successful (or idempotent) unsubscribe.
 *
 * `/subscribe/unsubscribe/done` resolves here, not to the `[token]` route:
 * static segments win over dynamic ones, and real tokens are UUIDs — never
 * the literal "done". This is intentional.
 */
export default function UnsubscribeDonePage() {
  return (
    <SubscribeMessage eyebrow="Unsubscribe" title="You’ve unsubscribed">
      <p>
        You&rsquo;ve been removed from The Next Brick and won&rsquo;t receive
        any more emails.
      </p>
      <p className="mt-4">
        Changed your mind? You can{" "}
        <Link
          href="/subscribe"
          className="underline hover:opacity-80"
          style={{ color: "var(--color-primary)" }}
        >
          subscribe again
        </Link>{" "}
        anytime.
      </p>
    </SubscribeMessage>
  );
}
